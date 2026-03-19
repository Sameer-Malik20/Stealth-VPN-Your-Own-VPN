document.addEventListener('DOMContentLoaded', async function() {
    // UI Elements
    const toggleBtn = document.getElementById('toggleBtn');
    const settingsBtn = document.getElementById('openSettings');
    const statusText = document.getElementById('statusText');
    const siteDomain = document.querySelector('.site-domain');
    const customSelect = document.querySelector('.custom-select');
    const selectedText = customSelect.querySelector('.proxy-name');
    const optionsContainer = customSelect.querySelector('.options-container');

    const DEFAULT_SERVERS = [
        { proxy: 'socks5:121.169.46.116:1090:dnrrfarc:cvbnihiajzzt', label: 'South Korea (Seoul)', flag: '🇰🇷', type: 'SOCKS5' },
        { proxy: 'http:8.213.128.6:8050:dnrrfarc:cvbnihiajzzt', label: 'South Korea (Busan)', flag: '🇰🇷', type: 'HTTP' },
        { proxy: 'http:198.23.239.134:6540:dnrrfarc:cvbnihiajzzt', label: 'USA (New York)', flag: '🇺🇸', type: 'HTTP' },
        { proxy: 'socks5:64.137.42.112:1080:dnrrfarc:cvbnihiajzzt', label: 'USA (Chicago)', flag: '🇺🇸', type: 'SOCKS5' },
        { proxy: 'http:207.244.217.165:6712:dnrrfarc:cvbnihiajzzt', label: 'USA (Los Angeles)', flag: '🇺🇸', type: 'HTTP' },
        { proxy: 'http:178.239.167.33:3128:dnrrfarc:cvbnihiajzzt', label: 'United Kingdom (London)', flag: '🇬🇧', type: 'HTTP' },
        { proxy: 'http:82.165.74.208:80:dnrrfarc:cvbnihiajzzt', label: 'Germany (Frankfurt)', flag: '🇩🇪', type: 'HTTP' },
        { proxy: 'http:160.251.231.135:8080:dnrrfarc:cvbnihiajzzt', label: 'Japan (Tokyo)', flag: '🇯🇵', type: 'HTTP' },
        { proxy: 'http:103.111.53.110:80:dnrrfarc:cvbnihiajzzt', label: 'India (Mumbai)', flag: '🇮🇳', type: 'HTTP' },
        { proxy: 'http:144.217.101.245:3128:dnrrfarc:cvbnihiajzzt', label: 'Canada (Montreal)', flag: '🇨🇦', type: 'HTTP' },
        { proxy: 'http:37.48.118.90:13042:dnrrfarc:cvbnihiajzzt', label: 'Netherlands (Amsterdam)', flag: '🇳🇱', type: 'HTTP' },
        { proxy: 'http:103.117.141.2:80:dnrrfarc:cvbnihiajzzt', label: 'Singapore', flag: '🇸🇬', type: 'HTTP' },
        { proxy: 'http:13.236.216.140:8080:dnrrfarc:cvbnihiajzzt', label: 'Australia (Sydney)', flag: '🇦🇺', type: 'HTTP' },
        { proxy: 'http:176.240.89.44:80:dnrrfarc:cvbnihiajzzt', label: 'Turkey (Istanbul)', flag: '🇹🇷', type: 'HTTP' },
        { proxy: 'http:186.250.60.218:8080:dnrrfarc:cvbnihiajzzt', label: 'Brazil (Sao Paulo)', flag: '🇧🇷', type: 'HTTP' },
        { proxy: 'http:51.158.111.242:8080:dnrrfarc:cvbnihiajzzt', label: 'France (Paris)', flag: '🇫🇷', type: 'HTTP' }
    ];

    let proxyInfoList = [];

    // Initialize UI
    async function init() {
        updateCurrentSite();
        await loadStore();
        
        // Force refresh list if version changed or it's first run (Clear old 2-country list)
        proxyInfoList = DEFAULT_SERVERS;
        setStoreItem('proxyInfoList', JSON.stringify(proxyInfoList));

        renderServers();
        updateUIFromState();
        refreshProxies(); // Fetch fresh ones in background
    }

    function renderServers() {
        optionsContainer.innerHTML = '';
        proxyInfoList.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'option';
            div.innerHTML = `
                <span class="proxy-type ${item.type.toLowerCase()}">${item.type}</span>
                <span>${item.label}</span>
                <span style="margin-left:auto">${item.flag || ''}</span>
            `;
            div.onclick = () => {
                selectServer(index);
                optionsContainer.classList.remove('show');
            };
            optionsContainer.appendChild(div);
        });

        // Set selected server text
        const currentIdx = parseInt(getStoreItem('currentProxyIndex', '0'));
        if (proxyInfoList[currentIdx]) {
            const s = proxyInfoList[currentIdx];
            selectedText.innerHTML = `${s.flag} ${s.label}`;
            
            // Auto-initialize proxy settings if missing
            if (!getStoreItem('proxySetting', '')) {
                selectServer(currentIdx);
            }
        }
    }

    function selectServer(index) {
        const item = proxyInfoList[index];
        if (!item) return;

        const parts = item.proxy.split(':');
        let type, host, port, user, pass;
        
        if (parts.length === 5) {
            [type, host, port, user, pass] = parts;
        } else {
            [host, port, user, pass] = parts;
            type = item.type || 'http';
        }

        const setting = {
            type: type,
            http_host: host,
            http_port: port,
            auth: { enable: true, user, pass }
        };

        setStoreItem('proxySetting', JSON.stringify(setting));
        setStoreItem('currentProxyIndex', index.toString());
        
        selectedText.innerHTML = `${item.flag} ${item.label}`;

        // If VPN is active, reconnect with new server
        chrome.proxy.settings.get({incognito: false}, (config) => {
            if (config.value.mode === 'pac_script') onProxy();
        });
    }

    async function refreshProxies() {
        try {
            // Fetch fresh proxies for all added countries
            const countries = 'KR,US,GB,DE,JP,IN,CA,NL,SG,AU,TR,BR,FR';
            const resp = await fetch(`https://proxylist.geonode.com/api/proxy-list?limit=30&page=1&sort_by=lastChecked&sort_type=desc&country=${countries}`);
            const data = await resp.json();
            if (data && data.data && data.data.length > 0) {
                const flagMap = { 'KR': '🇰🇷', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'JP': '🇯🇵', 'IN': '🇮🇳', 'CA': '🇨🇦', 'NL': '🇳🇱', 'SG': '🇸🇬', 'AU': '🇦🇺', 'TR': '🇹🇷', 'BR': '🇧🇷', 'FR': '🇫🇷' };
                const fetched = data.data.map(p => ({
                    proxy: `${p.protocols[0].toLowerCase()}:${p.ip}:${p.port}`,
                    label: `${p.country} - ${p.city || p.asnName || 'Server'}`,
                    flag: flagMap[p.country] || '🌐',
                    type: p.protocols[0].toUpperCase()
                }));
                // Merge with defaults
                proxyInfoList = [...DEFAULT_SERVERS, ...fetched];
                setStoreItem('proxyInfoList', JSON.stringify(proxyInfoList));
                renderServers();
            }
        } catch (e) {
            console.warn('Could not fetch external proxies, using defaults.');
        }
    }

    function updateUIFromState() {
        chrome.proxy.settings.get({incognito: false}, (config) => {
            const isActive = config.value.mode === 'pac_script';
            if (isActive) {
                toggleBtn.classList.add('active');
                statusText.innerText = 'Connected';
                statusText.className = 'status-value connected';
            } else {
                toggleBtn.classList.remove('active');
                statusText.innerText = 'Disconnected';
                statusText.className = 'status-value disconnected';
            }
        });
    }

    function updateCurrentSite() {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            if (tabs[0] && tabs[0].url) {
                try {
                    const url = new URL(tabs[0].url);
                    siteDomain.innerText = url.hostname;
                } catch(e) { siteDomain.innerText = 'Chrome'; }
            }
        });
    }

    // Listeners
    toggleBtn.onclick = () => {
        const isActive = toggleBtn.classList.contains('active');
        if (isActive) {
            offProxy();
            setTimeout(updateUIFromState, 100);
        } else {
            onProxy();
            setTimeout(updateUIFromState, 100);
        }
    };

    settingsBtn.onclick = () => chrome.runtime.openOptionsPage();

    customSelect.onclick = (e) => {
        e.stopPropagation();
        optionsContainer.classList.toggle('show');
    };

    document.onclick = () => optionsContainer.classList.remove('show');

    init();
});
