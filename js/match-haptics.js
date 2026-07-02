(function initMatchHaptics() {
  const SOUND_STORAGE_KEY = 'kinkeda-sound-enabled';
  const MATCH_BUZZ_MS = 500;
  const WINNER_BUZZ_MS = 1200;
  const MATCH_SOUND_URL = '/sounds/match_freesound_community-cheering-and-clapping-crowd-1-5995.mp3';
  const WINNER_SOUND_URL = '/sounds/winner_freesound_community-group_yay_cheer-101509.mp3';
  const NO_MATCH_SUSPENSE_SOUND_URL =
    '/sounds/suspense_universfield-crowd-disappointment-reaction-352718.mp3';

  let matchAudio = null;
  let winnerAudio = null;
  let noMatchSuspenseAudio = null;
  let soundEnabled = true;

  function loadSoundEnabled() {
    try {
      const stored = localStorage.getItem(SOUND_STORAGE_KEY);
      if (stored === '0') soundEnabled = false;
      else if (stored === '1') soundEnabled = true;
    } catch (_) {}
  }

  function setSoundEnabled(enabled) {
    soundEnabled = !!enabled;
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? '1' : '0');
    } catch (_) {}
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  loadSoundEnabled();

  function getMatchAudio() {
    if (!matchAudio && typeof Audio !== 'undefined') {
      matchAudio = new Audio(MATCH_SOUND_URL);
      matchAudio.preload = 'auto';
    }
    return matchAudio;
  }

  function getWinnerAudio() {
    if (!winnerAudio && typeof Audio !== 'undefined') {
      winnerAudio = new Audio(WINNER_SOUND_URL);
      winnerAudio.preload = 'auto';
    }
    return winnerAudio;
  }

  function getNoMatchSuspenseAudio() {
    if (!noMatchSuspenseAudio && typeof Audio !== 'undefined') {
      noMatchSuspenseAudio = new Audio(NO_MATCH_SUSPENSE_SOUND_URL);
      noMatchSuspenseAudio.preload = 'auto';
    }
    return noMatchSuspenseAudio;
  }

  function playAudioClip(audio) {
    if (!soundEnabled || !audio) return;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function playMatchCheer() {
    playAudioClip(getMatchAudio());
  }

  function playWinnerCheer() {
    playAudioClip(getWinnerAudio());
  }

  function playNoMatchSuspense() {
    playAudioClip(getNoMatchSuspenseAudio());
  }

  function fallbackVibrate(duration) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration);
    }
  }

  function vibrateViaCapacitor(duration) {
    const cap = window.Capacitor;
    if (!cap) return Promise.reject();

    const opts = { duration };

    try {
      const registered = cap.registerPlugin?.('Haptics');
      if (registered?.vibrate) return registered.vibrate(opts);
    } catch (_) {
      /* fall through */
    }

    if (cap.Plugins?.Haptics?.vibrate) {
      return cap.Plugins.Haptics.vibrate(opts);
    }

    if (typeof cap.nativePromise === 'function') {
      return cap.nativePromise('Haptics', 'vibrate', opts);
    }

    return Promise.reject();
  }

  function playBuzz(duration) {
    vibrateViaCapacitor(duration).catch(() => fallbackVibrate(duration));
  }

  function playMatchBuzz() {
    playMatchCheer();
    playBuzz(MATCH_BUZZ_MS);
  }

  function playWinnerCelebration() {
    playWinnerCheer();
    playBuzz(WINNER_BUZZ_MS);
  }

  window.KinkedaMatchHaptics = {
    playMatchBuzz,
    playWinnerCelebration,
    playNoMatchSuspense,
    isSoundEnabled,
    setSoundEnabled,
  };
})();
