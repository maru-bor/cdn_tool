import fetch from "node-fetch";

export async function cdnDetect(urlString){
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