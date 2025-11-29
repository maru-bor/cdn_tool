import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.use(express.static('client'));


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
            cdn: providersDetected.length > 0 ? [...providersDetected] : ['No CDN providers detected'],
            headers
        };

    }catch (err){
        return { status: 'error', message: err.message };
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
        console.log(data);
        return { status: 'success', ips};

    }catch (err){
        return { status: 'error', message: err.message };
    }

}

app.get('/api/test', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    const [dnsResult, cdnResult] = await Promise.all([
        dnsLookup(url),
        cdnDetect(url)
    ]);


    res.json({ url, modules: { dns: dnsResult, cdn: cdnResult } });
})

app.listen(3000, () => console.log(`Server listening on http://localhost:3000`))