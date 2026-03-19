# Stealth VPN V2 - Ultra Private & Secure (Chromium)

A premium-level, open-source VPN extension designed for maximum privacy, anonymity, and ease of use. Optimized for South Korea access and hardened against IP leaks.

## 🚀 Key Features

*   **🔒 Military-Grade Privacy**: Hardened against WebRTC leaks, search suggest tracking, and network metadata pre-fetching.
*   **🌍 Multi-Country Access**: Direct access to 15+ countries including South Korea, USA, UK, Japan, Germany, and more.
*   **⚡ Auto-Fetch Engine**: Dynamically fetches fresh proxies from verified public sources to ensure uptime.
*   **🛡️ Stealth Headers**: Automatically strips identifying headers like `X-Forwarded-For` and `Via` to stay invisible.
*   **💎 Premium UI**: Modern Glassmorphism-inspired interface with one-click connection.
*   **🚫 Zero Logs/Tracking**: No analytics, no accounts, no machine-identifying data leaves your browser.

## 🇰🇷 Optimized for South Korea
This extension includes specialized SOCKS5 and HTTP nodes for South Korea, providing low-latency access to regional content without location leaks.

## 🛡️ Security Hardening Details
1.  **WebRTC Protection**: Restricted to `disable_non_proxied_udp` to prevent real IP exposure via STUN/TURN.
2.  **Network Prediction Off**: Blocks Chrome from making "predictive" connections outside the proxy chain.
3.  **Header Stripping**: Uses `declarativeNetRequest` to remove tracking headers that proxies often add.
4.  **No Phoning Home**: Disabled Google's Search Suggest and alternate error pages to stop keystroke logging.

## 🌍 Supported Countries
- **Asia**: South Korea (SOCKS5/HTTP), Japan, India, Singapore.
- **Americas**: USA (NY, LA, Chicago), Canada, Brazil.
- **Europe**: UK, Germany, Netherlands, France, Turkey.
- **Oceania**: Australia.

## 🛠️ Installation (Developer Mode)

1.  Download this repository as a `.ZIP` and extract it, or clone it.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer Mode** (top right toggle).
4.  Click **Load Unpacked**.
5.  Select the `stealth-vpn-v2` folder.
6.  Pin the extension and enjoy!

## 📄 License
This project is for educational and privacy-advocacy purposes. MIT License.

Developed with ❤️ for the Privacy Community.
