// Stealth VPN V2 - Ultra Security Background Script
async function initBackground() {
    await loadStore();
    
    // --- NETWORK HARDENING ---
    if (chrome.privacy && chrome.privacy.network) {
        // 1. WebRTC IP Leak Protection (The most critical fix)
        chrome.privacy.network.webRTCIPHandlingPolicy.set({
            value: 'disable_non_proxied_udp'
        });

        // 2. Disable Network Prediction (Stops pre-fetching that bypasses proxy)
        chrome.privacy.network.networkPredictionEnabled.set({ value: false });
    }

    // --- BROWSER SERVICES HARDENING (Stops Phoning Home) ---
    if (chrome.privacy && chrome.privacy.services) {
        // 3. Disable Search Suggest (Stops sending keystrokes to Google)
        chrome.privacy.services.searchSuggestEnabled.set({ value: false });

        // 4. Disable Alternate Error Pages (Stops logging broken URLs)
        chrome.privacy.services.alternateErrorPagesEnabled.set({ value: false });

        // 5. Disable Autofill (Prevents phishing for machine/personal info)
        if (chrome.privacy.services.autofillEnabled) {
            chrome.privacy.services.autofillEnabled.set({ value: false });
        }

        // 6. Disable Safe Browsing Extended Reporting (Don't send stats back)
        if (chrome.privacy.services.safeBrowsingExtendedReportingEnabled) {
            chrome.privacy.services.safeBrowsingExtendedReportingEnabled.set({ value: false });
        }
    }
    
    console.log('Zero-Knowledge Stealth Mode: HARDENED & ACTIVE');
    
    // 7. Security Rules: Strip identifying headers (Strict Privacy)
    const rules = [
        {
            id: 1,
            priority: 1,
            action: {
                type: 'modifyHeaders',
                requestHeaders: [
                    { header: 'x-forwarded-for', operation: 'remove' },
                    { header: 'via', operation: 'remove' }
                ]
            },
            condition: { urlFilter: '*', resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other'] }
        }
    ];

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
        addRules: rules
    });
}

initBackground();

const action = chrome.action || chrome.browserAction;

// Generic error logging (Privacy-Safe)
chrome.proxy.onProxyError.addListener((details) => {
    console.warn('Proxy connectivity issue. Security remains active.');
});

// Icon and Status Management
function checkVPNStatus() {
    chrome.proxy.settings.get({'incognito': false}, (config) => {
        const isEnabled = config.value.mode === 'pac_script';
        const iconPath = isEnabled ? 'icons/on.png' : 'icons/off.png';
        action.setIcon({ path: iconPath });
    });
}

chrome.tabs.onActivated.addListener(() => checkVPNStatus());
chrome.tabs.onUpdated.addListener((id, change) => {
    if (change.status === "complete") checkVPNStatus();
});

// Secure Proxy Authentication
chrome.webRequest.onAuthRequired.addListener(
    (details) => {
        const proxySetting = getProxySetting();
        return {
            authCredentials: {
                username: proxySetting.auth?.user || "dnrrfarc",
                password: proxySetting.auth?.pass || "cvbnihiajzzt"
            }
        };
    }, 
    { urls: ["<all_urls>"] }, 
    ['blocking']
);
