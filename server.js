import express from 'express';
import { dnsLookup } from './modules/dnsLookup.js';
import { cdnDetect } from './modules/cdnDetect.js';
import { cacheAnalysis } from './modules/cacheAnalysis.js';
import { tlsDetect } from './modules/tlsDetect.js';
import { httpDetect } from './modules/httpDetect.js';
import { performanceTest } from './modules/performanceTest.js';

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