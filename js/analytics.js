(function (global) {
  const MEASUREMENT_ID = 'G-B90DQQ81ZW';

  let surface = 'unknown';
  let platform = 'web_browser';
  let initialized = false;

  function getAnalyticsPlatform() {
    const cap = global.Capacitor;
    if (cap?.isNativePlatform?.()) {
      const nativePlatform = cap.getPlatform?.();
      if (nativePlatform === 'android' || nativePlatform === 'ios') return nativePlatform;
      return 'native';
    }
    if (global.matchMedia?.('(display-mode: standalone)').matches || global.navigator.standalone === true) {
      return 'web_pwa';
    }
    return 'web_browser';
  }

  function ensureGtag() {
    global.dataLayer = global.dataLayer || [];
    if (!global.gtag) {
      global.gtag = function gtag() {
        global.dataLayer.push(arguments);
      };
    }
  }

  function baseParams() {
    return { surface, platform };
  }

  function init(nextSurface) {
    if (initialized) return;
    initialized = true;
    surface = nextSurface;
    platform = getAnalyticsPlatform();

    ensureGtag();
    global.gtag('js', new Date());

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);

    global.gtag('config', MEASUREMENT_ID, baseParams());
    global.gtag('set', 'user_properties', baseParams());
  }

  function trackEvent(eventName, params) {
    if (!initialized || typeof global.gtag !== 'function') return;
    global.gtag('event', eventName, {
      ...baseParams(),
      ...(params || {}),
    });
  }

  function bindCtaClicks(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('click', () => {
        trackEvent('cta_click', {
          cta_name: el.getAttribute('data-cta') || el.textContent?.trim() || 'unknown',
        });
      });
    });
  }

  global.KinkedaAnalytics = {
    init,
    trackEvent,
    bindCtaClicks,
    getPlatform: () => platform,
    getSurface: () => surface,
  };
}(window));
