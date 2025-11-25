import express from 'express';
import fetch from 'node-fetch';

const app = express();

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