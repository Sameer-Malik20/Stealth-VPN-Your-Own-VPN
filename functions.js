// Global storage management
let STORE = {};

async function loadStore() {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, (data) => {
            STORE = data || {};
            resolve(STORE);
        });
    });
}

function getStoreItem(key, defaultValue = '') {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key) || defaultValue;
    }
    return STORE[key] || defaultValue;
}

function setStoreItem(key, value) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
    }
    const data = {};
    data[key] = value;
    chrome.storage.local.set(data);
    STORE[key] = value;
}

function getProxySetting() {
    try {
        const setting = getStoreItem('proxySetting');
        return JSON.parse(setting || '{}');
    } catch (e) { return {}; }
}

function onProxy() {
    try {
        const proxySetting = getProxySetting();
        const proxyMode = getStoreItem('proxyMode', 'proxyAll');
        const domainList = (getStoreItem('domainList', '')).split('\n')
            .filter(line => line.trim())
            .map(domain => domain.trim().toLowerCase());

        const type = proxySetting.type || 'http';
        const host = proxySetting.http_host;
        const port = proxySetting.http_port;

        if (!host || !port) return null;

        const protocolKey = type.toUpperCase() === 'SOCKS5' ? 'SOCKS5' : 'PROXY';
        const proxyString = `${protocolKey} ${host}:${port}`;
        
        let pacScript = "";
        if (proxyMode === 'proxyAll') {
            pacScript = `function FindProxyForURL(url, host) { return "${proxyString}"; }`;
        } else if (proxyMode === 'proxyOnly') {
            pacScript = `
                function FindProxyForURL(url, host) {
                    var sites = ${JSON.stringify(domainList)};
                    for (var i = 0; i < sites.length; i++) {
                        if (dnsDomainIs(host, sites[i])) return "${proxyString}";
                    }
                    return "DIRECT";
                }
            `;
        } else {
            pacScript = `
                function FindProxyForURL(url, host) {
                    var sites = ${JSON.stringify(domainList)};
                    for (var i = 0; i < sites.length; i++) {
                        if (dnsDomainIs(host, sites[i])) return "DIRECT";
                    }
                    return "${proxyString}";
                }
            `;
        }

        chrome.proxy.settings.set({
            value: { mode: "pac_script", pacScript: { data: pacScript } },
            scope: 'regular'
        }, () => showNotification(true));

        return { host, port, type };
    } catch (error) {
        console.error('onProxy Error:', error);
    }
}

function offProxy() {
    chrome.proxy.settings.set({
        value: { mode: 'direct' },
        scope: 'regular'
    }, () => showNotification(false));
}

function setIcon(str) {
    const icon = { path: str === 'off' ? 'icons/off.png' : 'icons/on.png' };
    (chrome.action || chrome.browserAction).setIcon(icon);
}

function showNotification(isEnabled) {
    const proxySetting = getProxySetting();
    const title = isEnabled ? 'Security: Active' : 'Security: Disabled';
    const message = isEnabled 
        ? `Connected via Stealth: ${proxySetting.http_host}`
        : 'Privacy protection is now OFF';
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/' + (isEnabled ? 'on.png' : 'off.png'),
        title: title,
        message: message
    });
}

function callbackFn(details) {
    const proxySetting = getProxySetting();
    return {
        authCredentials: {
            username: proxySetting.auth?.user || "dnrrfarc",
            password: proxySetting.auth?.pass || "cvbnihiajzzt"
        }
    };
}
