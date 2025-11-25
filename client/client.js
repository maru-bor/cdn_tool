const dnsButton = document.getElementById('dnsButton');
const resultsDiv = document.getElementById('results');

dnsButton.addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        resultsDiv.innerText = 'Please enter a valid URL.';
        return;
    }

    try{
        const res = await fetch(`/api/test?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (data.modules.dns.status === 'success') {
            resultsDiv.innerHTML = `<strong>DNS Lookup for ${data.url}:</strong><br>` +
                `IP Addresses: ${data.modules.dns.ips.join(', ')}<br>` +
                `TTL: ${data.modules.dns.ttl} seconds`;
        }else {
            resultsDiv.innerHTML = `Error: ${data.modules.dns.message}`;
        }
    }catch (err){
        resultsDiv.innerText = 'Request failed: ' + err.message;
    }

})