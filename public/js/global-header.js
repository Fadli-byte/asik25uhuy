(function () {
  const STYLE_ID = 'global-header-styles';
  const THEME_KEY = 'siteThemePreference';

  const headerCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

    :root {
      --primary: #00b4a6;
      --secondary: #006b8c;
      --accent: #00e5d0;
      --dark: #003d52;
      --bg-primary: #ffffff;
      --text-primary: #333333;
      --text-secondary: #555555;
    }

    body[data-theme="dark"] {
      --bg-primary: #0a1128;
      --text-primary: #e0e0e0;
      --text-secondary: #b0b0b0;
    }

    body.has-global-header {
      padding-top: clamp(90px, 10vw, 110px);
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    .global-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: linear-gradient(-45deg, rgba(255,255,255,0.98), rgba(240,250,250,0.98), rgba(255,255,255,0.98), rgba(240,250,250,0.98));
      background-size: 400% 400%;
      backdrop-filter: blur(25px) saturate(200%);
      box-shadow: 0 10px 40px rgba(0, 180, 166, 0.15), 0 0 30px rgba(0,229,208,0.1);
      border-bottom: 3px solid rgba(0, 180, 166, 0.2);
      animation: globalHeaderShimmer 6s ease-in-out infinite;
      z-index: 1000;
    }

    .global-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #00b4a6 0%, #00e5d0 25%, #006b8c 50%, #00e5d0 75%, #00b4a6 100%);
      background-size: 300% 100%;
      animation: gradientFlow 6s linear infinite;
      box-shadow: 0 0 15px rgba(0,229,208,0.4);
      transition: opacity 0.5s ease;
    }

    .global-header.scrolled {
      background: rgba(255,255,255,0.85);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
      animation: none;
    }

    .global-header.scrolled::after {
      opacity: 0;
    }

    body[data-theme="dark"] .global-header {
      background: linear-gradient(90deg, rgba(0, 90, 80, 0.95) 0%, rgba(0, 107, 140, 0.95) 25%, rgba(0, 65, 90, 0.95) 50%, rgba(10, 17, 40, 0.95) 100%);
      animation: none;
    }

    body[data-theme="dark"] .global-header.scrolled {
      background: rgba(10, 17, 40, 0.95);
    }

    .global-header .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 32px;
      height: 100px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .global-header .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .global-header .logo-section:hover {
      transform: translateY(-2px);
    }

    .global-header .logo-icon {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 8px 20px rgba(0,180,166,0.3));
    }

    .global-header.scrolled .logo-icon {
      width: 60px;
      height: 60px;
    }

    .global-header .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .global-header .logo-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      color: var(--text-primary);
    }

    .global-header .logo-text .main-title {
      font-size: 1.3rem;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .global-header .logo-text .subtitle {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      color: var(--text-secondary);
    }

    .global-header .top-bar {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .global-header .user-greeting {
      padding: 10px 18px;
      background: linear-gradient(135deg, rgba(0,180,166,0.1), rgba(0,229,208,0.15));
      border-radius: 12px;
      border: 2px solid rgba(0,180,166,0.2);
      font-weight: 700;
      color: var(--primary);
      font-size: 0.92rem;
    }

    .global-header a,
    .global-header details summary {
      color: var(--text-primary);
      text-decoration: none;
      padding: 10px 18px;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      border-radius: 12px;
      text-transform: uppercase;
      transition: all 0.3s ease;
      position: relative;
    }

    .global-header a:hover,
    .global-header details summary:hover {
      color: var(--primary);
      background: rgba(0,180,166,0.12);
      transform: translateY(-2px);
    }

    .global-header details {
      position: relative;
    }

    .global-header details summary {
      list-style: none;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }

    .global-header details summary::-webkit-details-marker {
      display: none;
    }

    .global-header details summary::after {
      content: '▼';
      font-size: 0.7rem;
      transition: transform 0.3s ease;
    }

    .global-header details[open] summary::after {
      transform: rotate(180deg);
    }

    .global-header details ul {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(25px) saturate(200%);
      box-shadow: 0 15px 50px rgba(0,180,166,0.25);
      border-radius: 18px;
      min-width: 220px;
      padding: 12px 0;
      list-style: none;
      border: 2px solid rgba(0,180,166,0.2);
      z-index: 1000;
      animation: headerDropdown 0.3s ease;
    }

    body[data-theme="dark"] .global-header details ul {
      background: rgba(10, 17, 40, 0.98);
      border-color: rgba(0,229,208,0.4);
    }

    .global-header details ul li a {
      display: block;
      padding: 10px 18px;
      color: var(--text-primary);
      text-transform: none;
    }

    .global-header details ul li a:hover {
      background: linear-gradient(90deg, #00b4a6, #006b8c);
      color: #fff;
      transform: translateX(5px);
    }

    .global-header .logout {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: #fff !important;
      box-shadow: 0 4px 15px rgba(220,53,69,0.4);
    }

    .global-header .mobile-menu-toggle {
      display: none;
      background: linear-gradient(135deg, #00b4a6, #006b8c);
      border: none;
      color: #fff;
      font-size: 1.6rem;
      border-radius: 12px;
      padding: 8px 14px;
      cursor: pointer;
    }

    .theme-switch {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
    }

    body[data-theme="dark"] .theme-switch {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.1);
      color: #fff;
    }

    .theme-switch input {
      display: none;
    }

    .theme-switch .toggle {
      width: 46px;
      height: 22px;
      border-radius: 999px;
      background: rgba(0,0,0,0.2);
      position: relative;
    }

    .theme-switch .thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      position: absolute;
      top: 2px;
      left: 3px;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    .theme-switch input:checked + .toggle .thumb {
      transform: translateX(22px);
    }

    @media (max-width: 1024px) {
      .global-header .header-container {
        flex-wrap: wrap;
        height: auto;
        padding: 18px 20px;
        gap: 12px;
      }

      .global-header .top-bar {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        border-top: 1px solid rgba(0,0,0,0.1);
        padding-top: 10px;
        transition: all 0.3s ease;
      }

      .global-header .top-bar.active {
        max-height: 500px;
        opacity: 1;
      }

      .global-header .mobile-menu-toggle {
        display: block;
        margin-left: auto;
      }
    }

    @keyframes globalHeaderShimmer {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    @keyframes gradientFlow {
      0% { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }

    @keyframes headerDropdown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const headerTemplate = `
    <header class="global-header" id="header" data-global-header>
      <div class="header-container">
        <div class="logo-section" data-nav-home>
          <div class="logo-icon">
            <img src="/LOKO ASIK.png" alt="Logo Portal Ekosistem Laut">
          </div>
          <div class="logo-text">
            <span class="main-title">Portal Ekosistem Laut</span>
            <span class="subtitle">Pulau Tunda, Banten</span>
          </div>
        </div>

        <button class="mobile-menu-toggle" id="menuToggle" aria-label="Toggle menu">☰</button>

        <div class="top-bar" id="topBar">
          <div class="user-greeting">
            <span class="greeting-text">Halo, Pengguna 👋</span>
          </div>
          <a href="/home">Home</a>
          <details>
            <summary>Ekosistem</summary>
            <ul>
              <li><a href="/mangrove2019">🌳 Mangrove</a></li>
              <li><a href="/lamun2019">🌿 Lamun</a></li>
              <li><a href="/Terumbu2019">🪸 Terumbu Karang</a></li>
              <li><a href="/zpi">🐟 Ikan</a></li>
            </ul>
          </details>
          <details>
            <summary>Prediksi</summary>
            <ul>
              <li><a href="/prediksimangrove">🌳 Mangrove</a></li>
              <li><a href="/prediksilamun">🌿 Lamun</a></li>
              <li><a href="/prediksiterumbu">🪸 Terumbu Karang</a></li>
              <li><a href="/ekosistemikan">🐟 Ikan</a></li>
            </ul>
          </details>
          <details>
            <summary>FAQ</summary>
            <ul>
              <li><a href="/faq">🤖 BADU AI</a></li>
              <li><a href="/voice">🗣️ Translate</a></li>
              <li><a href="/kamera-ikan">📹 Kamera</a></li>
              <li><a href="/kameraikan">📰 Artikel Populer</a></li>
            </ul>
          </details>
          <a href="/logout" class="logout" data-action="logout">Logout</a>
          <a href="/login-admin">Login Admin</a>
          <label class="theme-switch" for="globalThemeToggle">
            ☀️
            <input type="checkbox" id="globalThemeToggle">
            <span class="toggle">
              <span class="thumb"></span>
            </span>
            🌙
          </label>
        </div>
      </div>
    </header>
  `;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = headerCSS;
    document.head.appendChild(style);
  }

  function buildHeader() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = headerTemplate.trim();
    return wrapper.firstElementChild;
  }

  function setTheme(mode) {
    const theme = mode === 'dark' ? 'dark' : 'light';
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }

  function initHeaderBehavior(headerEl) {
    const topBar = headerEl.querySelector('#topBar');
    const menuToggle = headerEl.querySelector('#menuToggle');
    const themeToggle = headerEl.querySelector('#globalThemeToggle');

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 60) {
        headerEl.classList.add('scrolled');
      } else {
        headerEl.classList.remove('scrolled');
      }
    });

    if (menuToggle && topBar) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        topBar.classList.toggle('active');
        menuToggle.textContent = topBar.classList.contains('active') ? '✕' : '☰';
      });
    }

    document.addEventListener('click', (e) => {
      if (topBar && menuToggle && !headerEl.contains(e.target)) {
        topBar.classList.remove('active');
        menuToggle.textContent = '☰';
      }
      headerEl.querySelectorAll('details[open]').forEach(detail => {
        if (!detail.contains(e.target)) {
          detail.removeAttribute('open');
        }
      });
    });

    headerEl.querySelectorAll('.top-bar a').forEach(link => {
      link.addEventListener('click', () => {
        if (topBar) {
          topBar.classList.remove('active');
        }
        if (menuToggle) {
          menuToggle.textContent = '☰';
        }
      });
    });

    if (themeToggle) {
      const storedTheme = localStorage.getItem(THEME_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
      themeToggle.checked = initialTheme === 'dark';
      themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked ? 'dark' : 'light');
      });
    }

    headerEl.querySelectorAll('[data-nav-home]').forEach(el => {
      el.addEventListener('click', () => {
        window.location.href = '/home';
      });
    });

    headerEl.querySelectorAll('[data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!confirm('Apakah Anda yakin ingin logout?')) {
          e.preventDefault();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    document.body.classList.add('has-global-header');

    let greeting = 'Halo, Pengguna 👋';
    const legacyHeaders = Array.from(document.querySelectorAll('header'));
    if (legacyHeaders.length) {
      const existingGreeting = legacyHeaders[0].querySelector('.greeting-text');
      if (existingGreeting && existingGreeting.textContent.trim()) {
        greeting = existingGreeting.textContent.trim();
      }
    }

    legacyHeaders.forEach(header => header.parentNode.removeChild(header));

    const headerEl = buildHeader();
    const greetingTarget = headerEl.querySelector('.greeting-text');
    if (greetingTarget) {
      greetingTarget.textContent = greeting;
    }

    document.body.prepend(headerEl);
    initHeaderBehavior(headerEl);
  });
})();

