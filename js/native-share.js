(function initNativeShare() {
  function isNativeShell() {
    const cap = window.Capacitor;
    if (cap?.isNativePlatform?.()) return true;
    if (window.androidBridge) return true;
    if (window.webkit?.messageHandlers?.bridge) return true;
    return false;
  }

  function showShareToast(message) {
    const existing = document.getElementById('share-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    toast.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:calc(env(safe-area-inset-bottom,0px) + 5.5rem)',
      'transform:translateX(-50%)',
      'z-index:100000',
      'max-width:min(92vw,24rem)',
      'padding:0.75rem 1rem',
      'border:2px solid #9a9078',
      'background:#1a1b20',
      'color:#e3e2e7',
      'font:700 0.95rem/1.3 "Hanken Grotesk",sans-serif',
      'text-align:center',
      'box-shadow:0 8px 24px rgba(0,0,0,0.45)',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2600);
  }

  function isShareCanceled(err) {
    const message = String(err?.message || err || '');
    return err?.name === 'AbortError' || /canceled|cancelled/i.test(message);
  }

  function getSharePlugin() {
    const cap = window.Capacitor;
    if (!cap) return null;

    if (cap.Plugins?.Share?.share) return cap.Plugins.Share;

    try {
      const registered = cap.registerPlugin?.('Share');
      if (registered?.share) return registered;
    } catch (_) {
      /* fall through */
    }

    return null;
  }

  function getFilesystemPlugin() {
    const cap = window.Capacitor;
    if (!cap) return null;

    if (cap.Plugins?.Filesystem?.writeFile && cap.Plugins?.Filesystem?.getUri) {
      return cap.Plugins.Filesystem;
    }

    try {
      const registered = cap.registerPlugin?.('Filesystem');
      if (registered?.writeFile && registered?.getUri) return registered;
    } catch (_) {
      /* fall through */
    }

    return null;
  }

  async function callNative(method, payload) {
    const cap = window.Capacitor;
    if (!cap) return false;

    if (typeof cap.nativePromise === 'function') {
      await cap.nativePromise('Share', method, payload);
      return true;
    }

    const plugin = getSharePlugin();
    if (!plugin?.[method]) return false;
    await plugin[method](payload);
    return true;
  }

  async function shareViaNative(payload) {
    if (!isNativeShell()) return false;
    return callNative('share', payload);
  }

  async function shareViaWebApi(shareData) {
    if (!navigator.share) return false;
    if (navigator.canShare && !navigator.canShare(shareData)) return false;
    await navigator.share(shareData);
    return true;
  }

  async function copyTextFallback(text) {
    if (!text) return false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        /* fall through */
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch (_) {
      return false;
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read blob'));
          return;
        }
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }

  async function writeBlobToCache(fs, blob, filename) {
    const base64 = await blobToBase64(blob);
    const path = filename || 'kinkeda-share.png';

    await fs.writeFile({
      path,
      data: base64,
      directory: 'CACHE',
    });

    const { uri } = await fs.getUri({
      path,
      directory: 'CACHE',
    });

    return uri;
  }

  async function shareText({ title, text, url, dialogTitle }) {
    const inviteText = text || url || '';
    const nativePayload = {
      title,
      text: inviteText,
      dialogTitle: dialogTitle || title || 'Share',
    };

    // Android share intent works more reliably with a single text field.
    if (!isNativeShell() && url && inviteText && !inviteText.includes(url)) {
      nativePayload.url = url;
    }

    try {
      if (await shareViaNative(nativePayload)) return { ok: true };
    } catch (err) {
      if (isShareCanceled(err)) return { ok: true, canceled: true };
      console.warn('Native share failed:', err);
    }

    const webPayload = { title, text: inviteText };
    if (url) webPayload.url = url;

    try {
      if (await shareViaWebApi(webPayload)) return { ok: true };
    } catch (err) {
      if (isShareCanceled(err)) return { ok: true, canceled: true };
      console.warn('Web share failed:', err);
    }

    if (await copyTextFallback(inviteText)) {
      showShareToast('Invite link copied to clipboard');
      return { ok: true, copied: true };
    }

    showShareToast('Unable to share right now');
    return { ok: false };
  }

  async function shareBlobFile({ title, text, blob, filename, dialogTitle }) {
    const fs = getFilesystemPlugin();
    if (fs && blob && isNativeShell()) {
      try {
        const uri = await writeBlobToCache(fs, blob, filename);
        if (await shareViaNative({
          title,
          text,
          dialogTitle: dialogTitle || title || 'Share',
          files: [uri],
        })) {
          return { ok: true };
        }
      } catch (err) {
        if (isShareCanceled(err)) return { ok: true, canceled: true };
        console.warn('Native file share failed:', err);
      }
    }

    if (!blob) return { ok: false };

    const file = new File([blob], filename || 'kinkeda-share.png', {
      type: blob.type || 'application/octet-stream',
    });
    const shareData = { files: [file], title, text };

    try {
      if (await shareViaWebApi(shareData)) return { ok: true };
    } catch (err) {
      if (isShareCanceled(err)) return { ok: true, canceled: true };
      console.warn('Web file share failed:', err);
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'kinkeda-share.png';
    link.click();
    URL.revokeObjectURL(url);
    return { ok: true, downloaded: true };
  }

  async function clearNativeServiceWorkerCache() {
    if (!isNativeShell() || !('serviceWorker' in navigator)) return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch (err) {
      console.warn('Could not unregister service workers:', err);
    }

    if (!('caches' in window)) return;

    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (err) {
      console.warn('Could not clear caches:', err);
    }
  }

  if (isNativeShell()) {
    clearNativeServiceWorkerCache();
  }

  window.KinkedaNativeShare = {
    shareText,
    shareBlobFile,
    isNativeShell,
  };
})();
