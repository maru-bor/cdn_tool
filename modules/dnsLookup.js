import fetch from "node-fetch";

export async function dnsLookup(hostname) {
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