/**
 * SAM MiniBot – Embeddable Widget Loader
 * Version: 1.0.0
 * Author: SAM MiniBot
 */

(function () {
  // =====================================================
  // 1️⃣ CONFIG DEFAULT
  // =====================================================
  const DEFAULT_CONFIG = {
    clientId: null,
    apiBase: '',
    theme: {
      primaryColor: '#2563eb',
      fontFamily: 'system-ui, sans-serif'
    },
    ui: {
      title: 'SAM MiniBot',
      position: 'bottom-right',
      launcherIcon: '💬'
    }
  };

  // =====================================================
  // 2️⃣ READ RUNTIME CONFIG
  // =====================================================
  const runtimeConfig = window.__SAM_MINIBOT_CONFIG__ || {};
  const config = deepMerge(DEFAULT_CONFIG, runtimeConfig);

  if (!config.clientId) {
    console.error('[SAM MiniBot] clientId is required');
    return;
  }

  if (!config.apiBase) {
    console.error('[SAM MiniBot] apiBase is required');
    return;
  }

  // =====================================================
  // 3️⃣ STATE
  // =====================================================
  let isOpen = false;
  let iframe = null;
  let launcher = null;

  // =====================================================
  // 4️⃣ INIT
  // =====================================================
  function init() {
    injectStyles();
    createLauncher();
    createIframe();
  }

  // =====================================================
  // 5️⃣ LAUNCHER BUTTON
  // =====================================================
  function createLauncher() {
    launcher = document.createElement('button');
    launcher.id = 'sam-minibot-launcher';
    launcher.innerHTML = config.ui.launcherIcon;

    launcher.addEventListener('click', toggleWidget);
    document.body.appendChild(launcher);
  }

  // =====================================================
  // 6️⃣ IFRAME
  // =====================================================
  function createIframe() {
    iframe = document.createElement('iframe');
    iframe.id = 'sam-minibot-iframe';
    iframe.src = `${config.apiBase}/widget/index.html`;
    iframe.allow = 'clipboard-write';
    iframe.style.display = 'none';

    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow.postMessage(
        {
          type: 'SAM_MINIBOT_INIT',
          payload: {
            clientId: config.clientId,
            apiBase: config.apiBase,
            theme: config.theme,
            ui: config.ui
          }
        },
        '*'
      );
    };
  }

  // =====================================================
  // 7️⃣ TOGGLE
  // =====================================================
  function toggleWidget() {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
  }

  // =====================================================
  // 8️⃣ STYLES
  // =====================================================
  function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      #sam-minibot-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: ${config.theme.primaryColor};
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(0,0,0,.2);
        z-index: 9999;
      }

      #sam-minibot-iframe {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 360px;
        height: 520px;
        border: none;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,.3);
        z-index: 9999;
        background: #fff;
      }

      @media (max-width: 640px) {
        #sam-minibot-iframe {
          width: 100vw;
          height: 100vh;
          bottom: 0;
          right: 0;
          border-radius: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =====================================================
  // 9️⃣ UTILS
  // =====================================================
  function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  }

  function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // =====================================================
  // 🚀 START
  // =====================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
