import fetch from "node-fetch";

export async function cacheAnalysis(urlString) {
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
