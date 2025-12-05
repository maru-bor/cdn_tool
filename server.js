import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.use(express.static('client'));

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
        return { status: 'error', code: "CACHE_FETCH_FAILED", message: err.message };
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
        return { status: 'error', code: "CDN_DETECTION_FAILED", message: err.message };
    }
}


async function dnsLookup(urlString) {
    try {
        const url = new URL(urlString);
        const hostname = url.hostname;

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
        return { status: 'error', code: "DNS_LOOKUP_FAILED", message: err.message };
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
        parsedURL = new URL(url);
    } catch (err) {
        return res.status(400).json({
            status: "error",
            code: "INVALID_URL",
            message: "The URL format is invalid. Example: https://example.com"
        });
    }

    const [dnsResult, cdnResult, cacheResult] = await Promise.all([
        dnsLookup(parsedURL.hostname),
        cdnDetect(parsedURL.hostname),
        cacheAnalysis(parsedURL.href)
    ]);

    res.json({ url, modules:
            {
                status: "success",
                url: parsedURL.href,
                modules: {
                    dns: dnsResult,
                    cdn: cdnResult,
                    cache: cacheResult
                }
            }
    });
})

app.listen(3000, () => console.log(`Server listening on http://localhost:3000`))