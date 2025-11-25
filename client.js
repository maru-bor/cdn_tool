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
            console.log(data.modules.dns.ips.join(', '))
        }else {
            resultsDiv.innerHTML = `Error: ${data.modules.dns.message}`;
        }
    }catch (err){
        resultsDiv.innerText = 'Request failed: ' + err.message;
    }

})