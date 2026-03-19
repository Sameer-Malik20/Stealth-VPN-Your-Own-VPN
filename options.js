document.addEventListener('DOMContentLoaded', async function() {
    await loadStore();
    
    const proxyList = document.getElementById('proxyList');
    const domainList = document.getElementById('domainList');
    const saveBtn = document.getElementById('saveBtn');

    proxyList.value = getStoreItem('proxyList', '');
    domainList.value = getStoreItem('domainList', '');

    saveBtn.onclick = () => {
        setStoreItem('proxyList', proxyList.value);
        setStoreItem('domainList', domainList.value);
        
        // Regenerate proxy info list from text
        const lines = proxyList.value.split('\n').filter(l => l.trim());
        const infoList = lines.map(line => {
            const parts = line.split(':');
            return {
                proxy: line,
                label: parts[1] || 'Custom Server',
                flag: '🌐',
                type: (parts[0] || 'http').toUpperCase()
            };
        });
        setStoreItem('proxyInfoList', JSON.stringify(infoList));
        
        alert('Settings Saved Successfully!');
    };
});
