import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.use(express.static('client'));




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
    const [dnsResult, tlsResult] = await Promise.all([
        dnsLookup(url),
        tlsInfo(url)
    ]);


    res.json({ url, modules: { dns: dnsResult, tls: tlsResult } });
})

app.listen(3000, () => console.log(`Server listening on http://localhost:3000`))