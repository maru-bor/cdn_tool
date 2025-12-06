const dnsButton = document.getElementById('dnsButton');
const resultsDiv = document.getElementById('results');
const errorMsg = {
    MISSING_URL: "You must enter a URL before continuing.",
    INVALID_URL: "The URL format is invalid. Try something like: https://example.com",
    DNS_LOOKUP_FAILED: "We couldn't resolve the domain name. The website may not exist.",
    CACHE_FETCH_FAILED: "Unable to retrieve cache headers. The site may block HEAD requests.",
    CDN_DETECTION_FAILED: "Unable to detect CDN providers.",
    TLS_CONNECTION_FAILED: "Failed to establish a secure TLS connection.",
    NO_CERTIFICATE: "The website does not provide a valid SSL certificate.",
    HTTP_PROTOCOL_DETECTION_FAILED: "Unable to detect the supported HTTP protocol.",
}

function displayError(code, rawMessage) {
    if (errorMsg[code]) {
        return `<span style="color:red;">${errorMsg[code]}</span>`;
    }
    return `<span style="color:red;">Unexpected error: ${rawMessage}</span>`;
}

function renderSection(title, module, fields) {
    let out = `<h3>${title}</h3>`;

    if (!module || module.status !== "success") {
        return out + displayError(module?.code, module?.message) + "<br>";
    }

    for (const field in fields) {
        const label = fields[field];
        const value = module[field];

        if (Array.isArray(value)) {
            out += `${label}: ${value.join(", ")}<br>`;
        } else {
            out += `${label}: ${value !== undefined ? value : "None"}<br>`;
        }
    }

    return out + "<br>";
}

dnsButton.addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        resultsDiv.innerHTML = displayError("MISSING_URL");
        return;
    }

    resultsDiv.innerText = 'Fetching URL info...';

    try{
        const res = await fetch(`/api/test?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        const modules = data.modules;
        let html = "";


        if (data.status === "error") {
            resultsDiv.innerHTML = displayError(data.code, data.message);
            return;
        }

        html += renderSection("DNS Lookup", modules.dns, {
            ips: "IP Addresses"
        });

        html += renderSection("CDN Detection", modules.cdn, {
            cdnProv: "CDN Provider(s)"
        });

        html += renderSection("Cache Header Analysis", modules.cache, {
            cacheControl: "Cache-Control",
            expires: "Expires",
            cacheability: "Cacheability"
        });


        html += renderSection("TLS/SSL Certificate", modules.tls, {
            protocol: "Protocol",
            issuer: "Issuer",
            validFrom: "Valid From",
            validTo: "Valid To",
            daysRemaining: "Days Remaining"
        });

        // html += renderSection("HTTP Protocol Detection", modules.httpProtocol, {
        //     protocol: "Supported HTTP Protocol"
        // });

        resultsDiv.innerHTML = html;


    }catch (err){
        resultsDiv.innerHTML = displayError("UNKNOWN_ERROR", err.message);
    }

})