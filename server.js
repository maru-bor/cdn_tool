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

        console.log(data);
    }catch (err){
        return { status: 'error', message: err.message };
    }

}

app.get('/api/test', async (req, res) => {
    const { url } = req.query;
    const dnsResult = await dnsLookup(url);


    res.json({ url, modules: { dns: dnsResult } });
})

app.listen(3000, () => console.log(`Server listening on http://localhost:3000`))