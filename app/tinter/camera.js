'use strict';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

export function createCameraController({ state, ui, isCurrentSession }) {
  let permissionTimer = 0;
  let resumeTimer = 0;
  let initialZoom = null;
  let lifecycleBound = false;

  const videoTrack = () => state.stream?.getVideoTracks?.()[0] || null;

  function stop() {
    window.clearTimeout(permissionTimer);
    window.clearTimeout(resumeTimer);
    permissionTimer = 0;
    resumeTimer = 0;
    initialZoom = null;
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      state.stream = null;
    }
    const video = ui.getVideo();
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }

  function applyBalance() {
    const { warmth, tint } = ui.getBalance();
    state.lightingCorrection = warmth;
    state.tintCorrection = tint;
    ui.applyFilters({ warmth, tint });
  }

  function resetBalance() {
    ui.setBalance({ warmth: 0, tint: 0 });
    applyBalance();
    ui.setBalanceNote('Adjust only when white does not look neutral.');
  }

  function autoBalance() {
    const video = ui.getVideo();
    if (!video?.videoWidth) {
      ui.setBalanceNote('The camera is still starting. Try again.');
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      const size = 72;
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas unavailable');
      context.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        red += pixels[index];
        green += pixels[index + 1];
        blue += pixels[index + 2];
        count++;
      }
      red /= count;
      green /= count;
      blue /= count;
      const warmth = clamp(Math.round((blue - red) * .55), -75, 75);
      const tint = clamp(Math.round((green - (red + blue) / 2) * .45), -55, 55);
      ui.setBalance({ warmth, tint });
      applyBalance();
      const strength = Math.abs(warmth) + Math.abs(tint);
      ui.setBalanceNote(strength < 25
        ? 'White already looks close to neutral.'
        : strength < 70
          ? 'Auto balance applied.'
          : 'A strong color cast remains. Neutral daylight will be more reliable.');
    } catch {
      ui.setBalanceNote('Auto balance could not read the camera. Adjust the sliders only if white looks tinted.');
    }
  }

  function sampleLighting(video) {
    const canvas = document.createElement('canvas');
    const size = 88;
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas unavailable');
    const crop = Math.min(video.videoWidth, video.videoHeight) * .62;
    context.drawImage(video, (video.videoWidth - crop) / 2, (video.videoHeight - crop) / 2, crop, crop, 0, 0, size, size);
    const pixels = context.getImageData(0, 0, size, size).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      red += pixels[index];
      green += pixels[index + 1];
      blue += pixels[index + 2];
      count++;
    }
    red /= count;
    green /= count;
    blue /= count;
    return {
      brightness: .2126 * red + .7152 * green + .0722 * blue,
      cast: Math.max(red, green, blue) - Math.min(red, green, blue)
    };
  }

  function classifyLighting(samples) {
    const brightness = samples.reduce((sum, item) => sum + item.brightness, 0) / samples.length;
    const cast = samples.reduce((sum, item) => sum + item.cast, 0) / samples.length;
    let key = 'good';
    let message = 'Lighting looks good.';
    if (brightness < 45) {
      key = 'low';
      message = 'The image is too dark. Face a window or add soft light.';
    } else if (brightness > 230) {
      key = 'low';
      message = 'The image is too bright. Move away from direct light.';
    } else if (cast > 75) {
      key = 'low';
      message = 'The room light is strongly colored. Neutral daylight will be more reliable.';
    } else if (brightness < 70 || brightness > 210 || cast > 48) {
      key = 'okay';
      message = 'Lighting is usable, but neutral daylight would improve confidence.';
    }
    return { key, message, brightness: Math.round(brightness), cast: Math.round(cast) };
  }

  async function restoreZoom(track = videoTrack()) {
    if (!track || track.readyState === 'ended') return;
    try {
      const capabilities = track.getCapabilities?.() || {};
      const settings = track.getSettings?.() || {};
      const zoom = capabilities.zoom;
      if (!zoom || !Number.isFinite(zoom.min) || !Number.isFinite(zoom.max)) return;
      if (!Number.isFinite(initialZoom)) initialZoom = Number.isFinite(settings.zoom) ? settings.zoom : zoom.min;
      const target = clamp(initialZoom, zoom.min, zoom.max);
      if (Math.abs((Number(settings.zoom) || target) - target) > .001) {
        await track.applyConstraints({ advanced: [{ zoom: target }] });
      }
    } catch {
      // Some mobile browsers expose zoom settings but reject manual constraints.
    }
  }

  async function resumeCamera() {
    if (document.hidden || !state.stream) return;
    const video = ui.getVideo();
    const track = videoTrack();
    if (!video || !track || track.readyState === 'ended') return;
    ui.refreshViewport?.();
    ui.resetCameraFrame?.();
    if (video.srcObject !== state.stream) video.srcObject = state.stream;
    try {
      await video.play();
    } catch {}
    await restoreZoom(track);
    ui.resetCameraFrame?.();
    await wait(180);
    if (document.hidden || !state.stream) return;
    ui.refreshViewport?.();
    ui.resetCameraFrame?.();
    await restoreZoom(track);
  }

  function scheduleResume() {
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;
      resumeCamera();
    }, 70);
  }

  function bindLifecycle() {
    if (lifecycleBound) return;
    lifecycleBound = true;
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) scheduleResume();
    });
    window.addEventListener('pageshow', scheduleResume);
    window.addEventListener('focus', scheduleResume);
  }

  async function checkLighting(session = state.sessionId) {
    const video = ui.getVideo();
    if (!video || !state.stream) return;
    ui.setInteractionEnabled(false);
    state.lightingConfidence = 'checking';
    ui.setLightBadge(null);
    ui.setStatus('Checking light…');
    try {
      for (let tries = 0; tries < 20 && !video.videoWidth; tries++) await wait(100);
      if (!isCurrentSession(session)) return;
      if (!video.videoWidth) throw new Error('Camera frame unavailable');
      const samples = [];
      for (let index = 0; index < 3; index++) {
        samples.push(sampleLighting(video));
        await wait(120);
        if (!isCurrentSession(session)) return;
      }
      const quality = classifyLighting(samples);
      state.lightingQuality = quality;
      state.lightingConfidence = quality.key;
      ui.setLightBadge(quality);
      ui.setInteractionEnabled(true);
      ui.setStatus(quality.key === 'good' ? '' : quality.message);
    } catch {
      if (!isCurrentSession(session)) return;
      const quality = {
        key: 'okay',
        message: 'Lighting could not be measured. You can continue, but confidence will be reduced.',
        brightness: null,
        cast: null
      };
      state.lightingQuality = quality;
      state.lightingConfidence = 'okay';
      ui.setLightBadge(quality);
      ui.setInteractionEnabled(true);
      ui.setStatus(quality.message);
    }
  }

  async function start(session = state.sessionId) {
    bindLifecycle();
    ui.setStatus('Starting camera…');
    ui.setInteractionEnabled(false);
    ui.setLightBadge(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API unavailable');
      permissionTimer = window.setTimeout(() => {
        if (!isCurrentSession(session) || state.stream) return;
        state.lightingConfidence = 'skipped';
        state.lightingQuality = { key: 'skipped', message: 'Waiting for camera permission', brightness: null, cast: null };
        ui.setLightBadge(state.lightingQuality);
        ui.setInteractionEnabled(true);
        ui.setStatus('Waiting for camera permission. You can still use the swatches.');
      }, 7000);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 }, frameRate: { ideal: 30, max: 30 } },
        audio: false
      });
      window.clearTimeout(permissionTimer);
      permissionTimer = 0;
      if (!isCurrentSession(session)) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      state.stream = stream;
      const track = videoTrack();
      const settings = track?.getSettings?.() || {};
      initialZoom = Number.isFinite(settings.zoom) ? settings.zoom : null;
      track?.addEventListener?.('unmute', scheduleResume);
      const video = ui.getVideo();
      video.srcObject = stream;
      ui.refreshViewport?.();
      ui.resetCameraFrame?.();
      await video.play();
      await restoreZoom(track);
      await checkLighting(session);
    } catch {
      window.clearTimeout(permissionTimer);
      permissionTimer = 0;
      if (!isCurrentSession(session)) return;
      state.lightingConfidence = 'skipped';
      state.lightingQuality = { key: 'skipped', message: 'Camera unavailable', brightness: null, cast: null };
      ui.setLightBadge(state.lightingQuality);
      ui.setInteractionEnabled(true);
      ui.setStatus('Camera unavailable. You can still compare the swatches or use the camera-free form.');
    }
  }

  bindLifecycle();

  return {
    start,
    stop,
    checkLighting,
    applyBalance,
    resetBalance,
    autoBalance,
    resumeCamera
  };
}
