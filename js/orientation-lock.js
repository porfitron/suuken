(function initOrientationLock() {
  const PORTRAIT = 'portrait';

  function getScreenOrientationPlugin() {
    const cap = window.Capacitor;
    if (!cap) return null;

    try {
      const registered = cap.registerPlugin?.('ScreenOrientation');
      if (registered?.lock) return registered;
    } catch (_) {
      /* fall through */
    }

    if (cap.Plugins?.ScreenOrientation?.lock) {
      return cap.Plugins.ScreenOrientation;
    }

    return null;
  }

  function lockViaWebApi() {
    const lock = screen.orientation?.lock;
    if (!lock) return Promise.resolve(false);
    return lock.call(screen.orientation, PORTRAIT)
      .then(function () { return true; })
      .catch(function () { return false; });
  }

  function lockViaCapacitor() {
    const plugin = getScreenOrientationPlugin();
    if (!plugin) return Promise.resolve(false);
    return plugin.lock({ orientation: PORTRAIT })
      .then(function () { return true; })
      .catch(function () { return false; });
  }

  function lockPortrait() {
    return lockViaCapacitor().then(function (locked) {
      if (locked) return true;
      return lockViaWebApi();
    });
  }

  let pendingGestureRetry = false;

  function bindGestureRetry() {
    if (pendingGestureRetry) return;
    pendingGestureRetry = true;

    function onGesture() {
      lockPortrait().then(function (locked) {
        if (locked) {
          window.removeEventListener('pointerdown', onGesture, true);
          window.removeEventListener('touchstart', onGesture, true);
        }
      });
    }

    window.addEventListener('pointerdown', onGesture, true);
    window.addEventListener('touchstart', onGesture, true);
  }

  function boot() {
    lockPortrait().then(function (locked) {
      if (!locked) bindGestureRetry();
    });

    window.addEventListener('orientationchange', function () {
      lockPortrait();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
