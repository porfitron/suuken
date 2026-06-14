(function initMatchHaptics() {
  const MATCH_BUZZ_MS = 500;

  function vibrateViaCapacitor(duration) {
    const cap = window.Capacitor;
    if (!cap) return false;

    try {
      const registered = cap.registerPlugin?.('Haptics');
      if (registered?.vibrate) {
        registered.vibrate({ duration }).catch(function () {});
        return true;
      }
    } catch (_) {
      /* fall through */
    }

    if (cap.Plugins?.Haptics?.vibrate) {
      cap.Plugins.Haptics.vibrate({ duration }).catch(function () {});
      return true;
    }

    return false;
  }

  function playMatchBuzz() {
    if (vibrateViaCapacitor(MATCH_BUZZ_MS)) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(MATCH_BUZZ_MS);
    }
  }

  window.KinkedaMatchHaptics = { playMatchBuzz: playMatchBuzz };
})();
