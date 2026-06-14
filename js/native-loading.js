(function initNativeLoading() {
  const PROGRESS_MS = 2800;
  const HOLD_AT_100_MS = 450;

  function hasNativeBridge() {
    const w = window;
    if (w.Capacitor?.isNativePlatform?.()) return true;
    if (w.androidBridge) return true;
    if (w.webkit?.messageHandlers?.bridge) return true;
    return false;
  }

  function hideNativeSplash() {
    const cap = window.Capacitor;
    if (!cap) return Promise.resolve();

    const opts = { fadeOutDuration: 200 };

    try {
      const registered = cap.registerPlugin?.('SplashScreen');
      if (registered?.hide) return registered.hide(opts);
    } catch (_) {
      /* fall through */
    }

    if (cap.Plugins?.SplashScreen?.hide) {
      return cap.Plugins.SplashScreen.hide(opts);
    }

    if (typeof cap.nativePromise === 'function') {
      return cap.nativePromise('SplashScreen', 'hide', opts);
    }

    return Promise.resolve();
  }

  function whenPainted(cb) {
    requestAnimationFrame(() => requestAnimationFrame(cb));
  }

  function cleanup(overlay) {
    overlay?.remove();
    document.documentElement.classList.remove('native-boot', 'native-ready');
  }

  function boot() {
    if (!hasNativeBridge()) return null;

    document.documentElement.classList.add('native-boot');

    const overlay = document.getElementById('native-loading');
    const fill = document.getElementById('native-loading-fill');
    if (overlay) {
      overlay.removeAttribute('hidden');
      overlay.setAttribute('aria-hidden', 'false');
    }
    if (fill) fill.style.transition = 'none';

    let finished = false;
    let gameReady = false;
    let progressDone = false;

    function setProgress(value) {
      const pct = Math.min(100, Math.max(0, Math.round(value)));
      if (fill) fill.style.width = `${pct}%`;
      const label = document.getElementById('native-loading-pct');
      if (label) label.textContent = `${pct}%`;
    }

    setProgress(0);

    function maybeFinish() {
      if (finished || !gameReady || !progressDone) return;
      finished = true;
      setProgress(100);
      document.documentElement.classList.remove('native-boot');
      document.documentElement.classList.add('native-ready');
      window.setTimeout(() => cleanup(overlay), 380);
    }

    function finish() {
      gameReady = true;
      maybeFinish();
    }

    function finishWhenReady() {
      finish();
    }

    function runProgressCycle() {
      const start = performance.now();

      function frame(now) {
        if (finished) return;
        const t = Math.min(1, (now - start) / PROGRESS_MS);
        const eased = 1 - (1 - t) ** 2;
        setProgress(eased * 100);

        if (t < 1) {
          requestAnimationFrame(frame);
          return;
        }

        progressDone = true;
        window.setTimeout(maybeFinish, HOLD_AT_100_MS);
      }

      requestAnimationFrame(frame);
    }

    whenPainted(() => {
      hideNativeSplash();
      runProgressCycle();
    });

    window.setTimeout(() => {
      if (!finished) {
        progressDone = true;
        gameReady = true;
        setProgress(100);
        maybeFinish();
      }
    }, 10000);

    return { setProgress, finish, finishWhenReady };
  }

  function tryBoot() {
    const api = boot();
    if (api) {
      window.KinkedaNativeLoading = api;
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const api = boot();
      if (api) {
        window.clearInterval(timer);
        window.KinkedaNativeLoading = api;
      } else if (attempts >= 120) {
        window.clearInterval(timer);
      }
    }, 25);
  }

  tryBoot();
})();
