import express from 'express';
import fetch from 'node-fetch';
import tls from "tls";

const app = express();

app.use(express.static('client'));

function normalizeURL(input) {

    let urlString = input.trim();

    if (!/^https?:\/\//i.test(urlString)) {
        urlString = "https://" + urlString;
    }

    const url = new URL(urlString);
    url.hostname = url.hostname.toLowerCase();

    if (url.pathname === "/") {
        url.pathname = "";
    }

    return url;

}

function isValidHostname(hostname) {
    const regex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(hostname);
}

async function performanceTest(urlString) {
    try {
        const url = new URL(urlString);

        const startTime = Date.now();

        const ttfbStart = Date.now();
        const res = await fetch(url.href);
        const ttfb = Date.now() - ttfbStart;


        return {
            status: "success",
            ttfb
        };

    } catch (err) {
        return {
            status: "error",
            code: "PERFORMANCE_TEST_FAILED"
        };
    }
}


async function httpDetect(urlString) {
    try {
        const url = new URL(urlString);

        return await new Promise((resolve) => {
            const socket = tls.connect(
                {
                    host: url.hostname,
                    port: 443,
                    servername: url.hostname,
                    ALPNProtocols: ["h2", "http/1.1"]
                },
                () => {
                    const protocol = socket.alpnProtocol || "unknown";

                    resolve({
                        status: "success",
                        protocol
                    });

                    socket.end();
                }
            );

            socket.on("error", (err) => {
                resolve({
                    status: "error",
                    code: "HTTP_PROTOCOL_DETECTION_FAILED"
                });
            });
        });

    } catch (err) {
        return {
            status: "error",
            code: "HTTP_PROTOCOL_BAD_URL"
        };
    }
}

async function tlsDetect(hostname) {
    return new Promise((resolve) => {
        const options = {
            host: hostname,
            port: 443,
            servername: hostname,
            rejectUnauthorized: false
        };

        const socket = tls.connect(options, () => {
            const cert = socket.getPeerCertificate();
            const protocol = socket.getProtocol();

            if (!cert || Object.keys(cert).length === 0) {
                resolve({
                    status: "error",
                    code: "NO_CERTIFICATE"
                });
                socket.end();
                return;
            }

            let daysRemaining = null;
            if (cert.valid_to) {
                const expiry = new Date(cert.valid_to);
                const now = new Date();
                const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                daysRemaining = diff;
            }

            resolve({
                status: "success",
                protocol,
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                daysRemaining,
            });

            socket.end();
        });

        socket.on("error", (err) => {
            resolve({
                status: "error",
                code: "TLS_CONNECTION_FAILED"
            });
        });
    });
}

async function cacheAnalysis(urlString) {
    try{
        const url = new URL(urlString);
        const res = await fetch(url, { method: 'HEAD'});


        const headers = {};
        res.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });


        const cacheControl = headers["cache-control"];
        const expires = headers["expires"];

        let cacheability = "unknown";

        if (!cacheControl && !expires) {
            cacheability = "no caching headers";
        } else if (cacheControl.includes("no-store")) {
            cacheability = "not cacheable (no-store)";
        } else if (cacheControl.includes("no-cache")) {
            cacheability = "revalidated on every request (no-cache)";
        } else if (cacheControl.includes("max-age")) {
            cacheability = "cacheable";
        } else if (expires) {
            cacheability = "cacheable (expires header)";
        }

        return {
            status: 'success',
            cacheControl,
            expires,
            cacheability
        };




    } catch (err){
        return { status: 'error', code: "CACHE_FETCH_FAILED"};
    }
}


async function cdnDetect(urlString){
    try{
        const url = new URL(urlString);
        const res = await fetch(url, { method: 'HEAD' });
        const headers = Object.fromEntries(res.headers.entries());
        const providersDetected = [];
        const headerString = JSON.stringify(headers).toLowerCase();

        if (headerString.includes('cloudflare')) providersDetected.push('Cloudflare');
        if (headerString.includes('x-amz-cf')) providersDetected.push('Amazon CloudFront');
        if (headerString.includes('akamai')) providersDetected.push('Akamai');

        return {
            status: 'success',
            cdnProv: providersDetected.length > 0 ? [...providersDetected] : ['No CDN providers detected'],
            headers
        };

    }catch (err){
        return { status: 'error', code: "CDN_DETECTION_FAILED"};
    }
}


async function dnsLookup(hostname) {
    try {
        const apiUrl = `https://cloudflare-dns.com/dns-query?name=${hostname}&type=A`;

        const res = await fetch(apiUrl, {
            headers: { 'Accept': 'application/dns-json' }
        });

        const data = await res.json();

        let ips = [];

        if (data.Answer && Array.isArray(data.Answer)) {
            ips = data.Answer.map(record => record.data);
        }
        return { status: 'success', ips};

    }catch (err){
        return { status: 'error', code: "DNS_LOOKUP_FAILED"};
    }

}

app.get('/api/test', async (req, res) => {
    const { url } = req.query;
    if (!url)  return res.status(400).json({
        status: "error",
        code: "MISSING_URL",
        message: "Please provide a valid URL."
    });

    let parsedURL;
    try {
        parsedURL = normalizeURL(url);
    } catch (err) {
        return res.status(400).json({
            status: "error",
            code: "INVALID_URL"
        });
    }

    if (!isValidHostname(parsedURL.hostname)) {
        return res.status(400).json({
            status: "error",
            code: "INVALID_URL"
        });
    }

    const [
        dnsResult,
        cdnResult,
        cacheResult,
        tlsResult,
        httpResult,
        perfResult] = await Promise.all([
        dnsLookup(parsedURL.hostname),
        cdnDetect(parsedURL.href),
        cacheAnalysis(parsedURL.href),
        tlsDetect(parsedURL.hostname),
        httpDetect(parsedURL.href),
        performanceTest(parsedURL.href)
    ]);

    res.json({
        status: "success",
        url: parsedURL.href,
        modules: {
            dns: dnsResult,
            cdn: cdnResult,
            cache: cacheResult,
            tls: tlsResult,
            http: httpResult,
            perf: perfResult
        }
    });
})

app.listen(3000, () => console.log(`Server listening on http://localhost:3000`))