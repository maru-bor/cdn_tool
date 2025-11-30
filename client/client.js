const dnsButton = document.getElementById('dnsButton');
const resultsDiv = document.getElementById('results');

dnsButton.addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        resultsDiv.innerText = 'Please enter a valid URL.';
        return;
    }

    resultsDiv.innerText = 'Fetching URL info...';

    try{
        const res = await fetch(`/api/test?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (data.modules.dns.status === 'success') {
            resultsDiv.innerHTML = `<strong>DNS Lookup for ${data.url}:</strong><br>` +
                `IP Addresses: ${data.modules.dns.ips.join(', ')}<br>`;
        }else {
            resultsDiv.innerHTML = `Error: ${data.modules.dns.message}`;
        }

        if(data.modules.cdn.status === 'success'){
            resultsDiv.innerHTML += `<br><strong>CDN Detection:</strong><br>` +
                `CDN Provider(s): ${data.modules.cdn.cdnProv.join(', ')}<br>`;
        }else {
            resultsDiv.innerHTML += `Error: ${data.modules.cdn.message}`;
        }

        if (data.modules.cache.status === 'success') {
            resultsDiv.innerHTML += `<br><strong>Cache header analysis:</strong><br>` +
                `Cache-control: ${data.modules.cache.cacheControl}<br>` +
                `Expires: ${data.modules.cache.expires}<br>` +
                `Cacheability: ${data.modules.cache.cacheability}<br>`;
        }else {
            resultsDiv.innerHTML += `Error: ${data.modules.cache.message}`;
        }

    }catch (err){
        resultsDiv.innerText = 'Request failed: ' + err.message;
    }

})