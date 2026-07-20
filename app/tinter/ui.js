'use strict';

const q = (selector, root = document) => root.querySelector(selector);
const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const logoHtml = () => '<span class="tinter-logo-lockup"><span class="tinter-style-glyph" aria-hidden="true">style</span><span class="tinter-word">tinter</span></span>';

const HELP = {
  temp: {
    title: 'Warm or cool?',
    body: 'A color that is too warm can make skin look more yellow or red. A color that is too cool can make skin look gray or bluish. Choose the one that changes your natural skin tone the least.'
  },
  value: {
    title: 'Light or dark?',
    body: 'A color that is too dark can deepen shadows under the eyes and jaw. A color that is too light can wash out the eyes and brows. Choose the depth that keeps your face visible without looking heavy.'
  },
  chroma: {
    title: 'Muted or bright?',
    body: 'A color that is too bright can make redness or skin texture stand out. A color that is too muted can make the face look dull or gray. Choose the one that makes you look healthy without taking over.'
  },
  def: {
    title: 'Soft or strong contrast?',
    body: 'Too much contrast can make shadows and skin texture look harsher. Too little contrast can make the eyes, brows, and lips fade. Choose the amount that keeps your features clear without making the face look hard.'
  },
  hue: {
    title: 'Which accent supports your face?',
    body: 'The wrong accent can compete with your eyes and lips or add a red, yellow, or gray cast to the skin. Choose the one that supports your features instead of pulling attention away from them.'
  },
  generic: {
    title: 'What should you compare?',
    body: 'Watch your skin, facial shadows, eyes, brows, and lips. Choose the color that improves the face, not simply the swatch you like more.'
  }
};

const modalHtml = () => `<section id="tinterModal" class="tinter-modal" hidden role="dialog" aria-modal="true" aria-label="Tinter color analysis">
  <div id="tinterCard" class="tinter-card">
    <header class="tinter-head">
      <div class="tinter-interface-brand">${logoHtml()}</div>
      <div class="tinter-head-actions">
        <button type="button" id="tinterSettings" class="tinter-icon-button tinter-settings-toggle" aria-expanded="false" aria-controls="tinterBalance" aria-label="Open camera settings" title="Camera settings"><span class="tinter-settings-icon" aria-hidden="true"><i></i><i></i><i></i></span></button>
        <button type="button" id="tinterClose" class="tinter-icon-button tinter-close" aria-label="Close Tinter">×</button>
      </div>
    </header>
    <div class="tinter-progress" aria-hidden="true"><i id="tinterBar"></i></div>
    <button type="button" id="tinterLightBadge" class="tinter-light-badge" data-quality="checking" aria-label="Checking lighting" title="Checking lighting"></button>
    <div id="tinterPrompt" class="tinter-question" aria-live="polite"></div>
    <div id="tinterStage" class="tinter-stage">
      <video id="tinterVideo" autoplay playsinline muted></video>
      <div id="tinterWarmFilter" class="tinter-video-filter"></div>
      <div id="tinterTintFilter" class="tinter-video-filter"></div>
      <div id="smoothDrape" class="smooth-drape-preview"></div>
      <div id="smoothDeck" class="smooth-deck"></div>
      <div id="tinterReturnZone" class="tinter-return-zone" aria-hidden="true"><span>Release here to put the card back</span></div>
      <div class="tinter-choice-footer"><button type="button" id="tinterTie" class="tinter-no-diff">They look about the same</button></div>
    </div>
    <section id="tinterBalance" class="tinter-balance" hidden aria-label="Camera color balance">
      <div class="tinter-balance-top"><b>Camera balance</b><button type="button" id="tinterAutoTemp" class="secondary">Auto balance</button></div>
      <p class="tinter-balance-note">Point at white paper or a white wall, tap Auto balance, then return to your face.</p>
      <div class="tinter-balance-grid">
        <label>Warmth<input type="range" id="tinterWarmth" min="-100" max="100" value="0"></label>
        <label>Tint<input type="range" id="tinterTint" min="-100" max="100" value="0"></label>
      </div>
      <p id="tinterBalanceNote" class="tinter-balance-note">Adjust only when white does not look neutral.</p>
    </section>
    <p id="tinterStatus" class="tinter-status" aria-live="polite"></p>
    <section id="tinterQuestionHelpPanel" class="tinter-question-help-panel" hidden aria-labelledby="tinterQuestionHelpTitle">
      <p class="tinter-help-kicker">What to look for</p>
      <h3 id="tinterQuestionHelpTitle"></h3>
      <p id="tinterQuestionHelpBody"></p>
      <p id="tinterQuestionHelpNote" class="tinter-help-note" hidden></p>
      <button type="button" id="tinterQuestionHelpDone" class="tinter-help-done">Got it</button>
    </section>
    <div id="tinterSummary" class="tinter-summary" hidden><b>Analysis complete</b><p>Building your palette…</p></div>
  </div>
</section>`;

function helpFor(item) {
  if (!item) return HELP.generic;
  return {
    ...(HELP[item.axis] || HELP.generic),
    note: item.validation ? 'This is a final prediction check. It does not change your palette score.' : ''
  };
}

export function createTinterUI({
  state,
  currentQuestion,
  phaseLabel,
  onChoose,
  onTie,
  onClose,
  onRecheckLighting,
  onAutoBalance,
  onBalanceChange
}) {
  let helpOpen = false;
  let settingsOpen = false;
  let savedScroll = 0;
  let lastFocus = null;

  const updateViewport = () => {
    const height = Math.max(window.innerHeight || 0, window.visualViewport?.height || 0);
    document.documentElement.style.setProperty('--tinter-height', `${Math.round(height)}px`);
  };

  function refreshViewport() {
    updateViewport();
    requestAnimationFrame(updateViewport);
    window.setTimeout(updateViewport, 120);
    window.setTimeout(updateViewport, 360);
  }

  function resetCameraFrame() {
    const video = q('#tinterVideo');
    if (!video) return;
    video.style.objectFit = 'cover';
    video.style.objectPosition = '50% 50%';
    video.style.transform = 'scaleX(-1) translate3d(0,0,0)';
    void video.offsetHeight;
  }

  function lockViewport() {
    savedScroll = window.scrollY || 0;
    lastFocus = document.activeElement;
    refreshViewport();
    document.body.classList.add('tinter-active');
    Object.assign(document.body.style, {
      position: 'fixed',
      top: `-${savedScroll}px`,
      left: '0',
      right: '0',
      width: '100%'
    });
    window.visualViewport?.addEventListener('resize', updateViewport);
  }

  function unlockViewport() {
    window.visualViewport?.removeEventListener('resize', updateViewport);
    document.body.classList.remove('tinter-active');
    for (const property of ['position', 'top', 'left', 'right', 'width']) document.body.style[property] = '';
    window.scrollTo(0, savedScroll || 0);
  }

  function init() {
    if (!q('#tinterModal')) document.body.insertAdjacentHTML('beforeend', modalHtml());
    bind();
    setLaunchComplete(false);
  }

  function bind() {
    q('#tinterClose').onclick = () => onClose({ scrollToResults: false });
    q('#tinterSettings').onclick = () => setSettingsOpen(!settingsOpen);
    q('#tinterTie').onclick = onTie;
    q('#tinterLightBadge').onclick = onRecheckLighting;
    q('#tinterAutoTemp').onclick = onAutoBalance;
    q('#tinterWarmth').oninput = onBalanceChange;
    q('#tinterTint').oninput = onBalanceChange;
    q('#tinterQuestionHelpDone').onclick = closeHelp;
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', event => {
      if (helpOpen && !event.target.closest?.('#tinterQuestionHelpPanel,#tinterQuestionHelpButton')) closeHelp();
    });
    window.addEventListener('resize', () => {
      refreshViewport();
      positionHelp();
    });
  }

  function setLaunchComplete(complete) {
    const button = q('#tinterOpen');
    const prompt = q('#tinterStartPrompt');
    if (button) {
      button.classList.toggle('tinter-complete', complete);
      button.setAttribute('aria-label', complete ? 'Run Tinter again' : 'Start Tinter color analysis');
      button.title = complete ? 'Run Tinter again' : 'Start Tinter';
      button.innerHTML = logoHtml();
    }
    if (prompt) prompt.textContent = complete ? 'Tap to retake' : 'Press to start';
  }

  function openModal() {
    q('#tinterModal').hidden = false;
    lockViewport();
    resetCameraFrame();
    setSettingsOpen(false);
    closeHelp();
    q('#tinterClose')?.focus({ preventScroll: true });
  }

  function closeModal({ scrollToResults = false } = {}) {
    q('#tinterModal').hidden = true;
    setSettingsOpen(false);
    closeHelp();
    unlockViewport();
    lastFocus?.focus?.({ preventScroll: true });
    if (scrollToResults) {
      window.setTimeout(() => {
        q('.report-area')?.scrollIntoView({
          behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }, 180);
    }
  }

  function setSettingsOpen(open) {
    settingsOpen = Boolean(open);
    const panel = q('#tinterBalance');
    const button = q('#tinterSettings');
    panel.hidden = !settingsOpen;
    button.setAttribute('aria-expanded', String(settingsOpen));
    button.setAttribute('aria-label', settingsOpen ? 'Close camera settings' : 'Open camera settings');
    button.classList.toggle('is-active', settingsOpen);
    q('#tinterCard').classList.toggle('settings-open', settingsOpen);
    if (settingsOpen) closeHelp();
  }

  function positionHelp() {
    const panel = q('#tinterQuestionHelpPanel');
    const prompt = q('#tinterPrompt');
    if (panel && !panel.hidden && prompt) panel.style.top = `${Math.round(prompt.offsetTop + prompt.offsetHeight + 8)}px`;
  }

  function openHelp() {
    const item = currentQuestion();
    if (!item) return;
    const help = helpFor(item);
    q('#tinterQuestionHelpTitle').textContent = help.title;
    q('#tinterQuestionHelpBody').textContent = help.body;
    const note = q('#tinterQuestionHelpNote');
    note.textContent = help.note || '';
    note.hidden = !help.note;
    q('#tinterQuestionHelpPanel').hidden = false;
    q('#tinterQuestionHelpButton')?.setAttribute('aria-expanded', 'true');
    q('#tinterCard').classList.add('question-help-open');
    helpOpen = true;
    positionHelp();
  }

  function closeHelp() {
    const panel = q('#tinterQuestionHelpPanel');
    if (panel) panel.hidden = true;
    q('#tinterQuestionHelpButton')?.setAttribute('aria-expanded', 'false');
    q('#tinterCard')?.classList.remove('question-help-open');
    helpOpen = false;
  }

  function renderPrompt(item, index) {
    const prompt = q('#tinterPrompt');
    prompt.replaceChildren();

    const label = document.createElement('span');
    label.className = 'tinter-question-label';
    label.textContent = phaseLabel(item.stage);

    const main = document.createElement('span');
    main.className = 'tinter-question-main';
    main.textContent = item.question;

    const count = document.createElement('span');
    count.className = 'tinter-step-count';
    count.textContent = `Question ${index + 1}`;

    const hint = document.createElement('span');
    hint.className = 'tinter-judge-inline';
    hint.textContent = item.hint;

    const help = document.createElement('button');
    help.type = 'button';
    help.id = 'tinterQuestionHelpButton';
    help.className = 'tinter-question-help';
    help.textContent = 'i';
    help.setAttribute('aria-expanded', 'false');
    help.setAttribute('aria-controls', 'tinterQuestionHelpPanel');
    help.setAttribute('aria-label', `More help for ${item.label || 'this question'}`);
    help.title = 'What should I look for?';
    help.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      helpOpen ? closeHelp() : openHelp();
    };

    prompt.append(label, main, count, hint, help);
  }

  function cardElement(side, item) {
    const card = document.createElement('article');
    card.className = 'smooth-card blind-card';
    card.dataset.side = side;
    card.role = 'button';
    card.tabIndex = 0;
    card.style.background = item[side].hex;
    card.setAttribute('aria-label', `Choose drape ${side === 'left' ? 'A' : 'B'}`);
    wireCard(card);
    return card;
  }

  function renderQuestion(item, index) {
    closeHelp();
    q('#tinterCard').classList.remove('done');
    q('#tinterStage').classList.remove('smooth-done', 'tie-chosen');
    q('#tinterStage').dataset.phase = item.stage;
    q('#tinterSummary').hidden = true;
    renderPrompt(item, index);
    q('#smoothDeck').replaceChildren(cardElement('left', item), cardElement('right', item));
    clearPreview();
    setInteractionEnabled(state.interactionReady);
  }

  function clearPreview() {
    const drape = q('#smoothDrape');
    if (drape) {
      drape.style.opacity = '0';
      drape.style.transform = 'translate3d(0,0,0) scaleY(0)';
    }
    qa('.smooth-card').forEach(card => {
      card.classList.remove('is-muted', 'is-dragging', 'is-throwing', 'is-returning', 'is-commit-ready');
      card.style.transform = '';
      card.style.transitionDuration = '';
      card.style.transitionTimingFunction = '';
    });
    q('#tinterStage')?.classList.remove('tie-chosen', 'card-drag-active', 'card-commit-ready');
    const text = q('#tinterReturnZone span');
    if (text) text.textContent = 'Release here to put the card back';
  }

  function setPreview(side, progress) {
    const item = currentQuestion();
    const drape = q('#smoothDrape');
    if (!item || !drape) return;
    const color = item[side].hex;
    if (drape.dataset.color !== color) {
      drape.dataset.color = color;
      drape.style.background = `linear-gradient(to top,${color} 0%,${color} 46%,${color}99 68%,transparent 100%)`;
    }
    drape.style.opacity = String(.08 + progress * .70);
    drape.style.transform = `translate3d(0,0,0) scaleY(${.18 + progress * .82})`;
  }

  function setInteractionEnabled(enabled) {
    state.interactionReady = Boolean(enabled);
    q('#tinterStage')?.classList.toggle('lighting-checking', !enabled);
    q('#tinterTie').disabled = !enabled;
    qa('.smooth-card').forEach(card => {
      card.setAttribute('aria-disabled', String(!enabled));
      card.tabIndex = enabled ? 0 : -1;
    });
  }

  function returnCard(card) {
    const drape = q('#smoothDrape');
    card.classList.add('is-returning');
    card.style.transitionDuration = '';
    card.style.transitionTimingFunction = '';
    if (drape) {
      drape.style.opacity = '0';
      drape.style.transform = 'translate3d(0,0,0) scaleY(0)';
    }
    qa('.smooth-card').forEach(other => {
      if (other !== card) other.classList.remove('is-muted');
    });
    requestAnimationFrame(() => {
      card.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    });

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      card.classList.remove('is-returning');
      card.style.transform = '';
      clearPreview();
    };
    card.addEventListener('transitionend', finish, { once: true });
    window.setTimeout(finish, 360);
  }

  const threshold = () => Math.max(190, (q('#tinterStage')?.clientHeight || 640) * .30);

  function wireCard(card) {
    const side = card.dataset.side;
    const stage = q('#tinterStage');
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let velocityX = 0;
    let velocityY = 0;
    let sampleX = 0;
    let sampleY = 0;
    let sampleTime = 0;
    let dragging = false;
    let frame = 0;
    let pointerId = null;
    let other = null;

    const sample = point => {
      const time = Number.isFinite(point.timeStamp) ? point.timeStamp : performance.now();
      if (sampleTime) {
        const elapsed = clamp(time - sampleTime, 1, 80);
        const instantX = (point.clientX - sampleX) / elapsed;
        const instantY = (point.clientY - sampleY) / elapsed;
        velocityX = velocityX * .35 + instantX * .65;
        velocityY = velocityY * .35 + instantY * .65;
      }
      sampleX = point.clientX;
      sampleY = point.clientY;
      sampleTime = time;
      dx = point.clientX - startX;
      dy = point.clientY - startY;
    };

    const projectedDy = () => dy + velocityY * 220;
    const hasUpwardIntent = () => dy < -18 && -dy > Math.abs(dx) * .35;
    const isFlickReady = () => velocityY < -.65 && hasUpwardIntent() && projectedDy() <= -threshold();
    const isCommitReady = () => dy <= -threshold() || isFlickReady();

    const draw = () => {
      frame = 0;
      const progress = clamp(Math.max(0, -dy) / ((stage?.clientHeight || 1) * .42), 0, 1);
      const rotation = clamp(dx / 16, -12, 12);
      card.style.transform = `translate3d(${dx}px,${dy}px,0) rotate(${rotation}deg) scale(${1 + progress * .1})`;
      setPreview(side, progress);
      other?.classList.toggle('is-muted', progress > .08);
      const moved = Math.hypot(dx, dy);
      const ready = isCommitReady();
      stage?.classList.toggle('card-drag-active', moved >= 8);
      stage?.classList.toggle('card-commit-ready', ready);
      card.classList.toggle('is-commit-ready', ready);
      const label = q('#tinterReturnZone span');
      if (label) label.textContent = ready ? 'Release now to choose this color' : 'Release here to put the card back';
    };

    const end = (event, cancelled = false) => {
      if (!dragging || state.busy) return;
      event?.preventDefault();
      if (event && Number.isFinite(event.clientX)) sample(event);
      dragging = false;
      card.classList.remove('is-dragging');
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        draw();
      }
      const moved = Math.hypot(dx, dy);
      const deliberate = isCommitReady();
      try {
        if (pointerId !== null) card.releasePointerCapture(pointerId);
      } catch {}
      pointerId = null;
      if (!cancelled && moved < 9) selectCard(card, side, 0, -30, 0, 0);
      else if (!cancelled && deliberate) selectCard(card, side, dx, dy, velocityX, velocityY);
      else returnCard(card);
    };

    card.onpointerdown = event => {
      if (state.busy || !state.interactionReady || helpOpen) return;
      event.preventDefault();
      event.stopPropagation();
      dragging = true;
      pointerId = event.pointerId;
      startX = sampleX = event.clientX;
      startY = sampleY = event.clientY;
      sampleTime = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
      dx = dy = velocityX = velocityY = 0;
      other = qa('.smooth-card').find(item => item !== card);
      card.classList.add('is-dragging');
      try {
        card.setPointerCapture(pointerId);
      } catch {}
    };

    card.onpointermove = event => {
      if (!dragging || state.busy) return;
      event.preventDefault();
      const points = event.getCoalescedEvents?.() || [event];
      for (const point of points) sample(point);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    card.onpointerup = event => end(event, false);
    card.onpointercancel = event => end(event, true);
    card.onkeydown = event => {
      if ((event.key === 'Enter' || event.key === ' ') && !state.busy && state.interactionReady) {
        event.preventDefault();
        selectCard(card, side, 0, -30, 0, 0);
      }
    };
  }

  function selectCard(card, side, dx = 0, dy = -30, velocityX = 0, velocityY = 0) {
    if (state.busy || !state.interactionReady || helpOpen) return;
    const accepted = onChoose(side);
    if (accepted === false) return;
    const speed = Math.hypot(velocityX, velocityY);
    const carryX = clamp(velocityX * 190, -260, 260);
    const carryY = clamp(velocityY * 300, -680, 100);
    const throwX = dx * 1.06 + carryX;
    const throwY = Math.min(dy - 280, dy + carryY - 170);
    const rotation = dx === 0 ? (side === 'left' ? -12 : 12) : clamp((dx + carryX) / 12, -22, 22);
    const duration = Math.round(clamp(300 - speed * 70, 155, 270));
    const scale = 1.16 + Math.min(.18, speed * .055);
    card.classList.add('is-throwing');
    card.style.transitionDuration = `${duration}ms`;
    card.style.transitionTimingFunction = 'cubic-bezier(.14,.82,.25,1)';
    card.style.transform = `translate3d(${throwX}px,${throwY}px,0) rotate(${rotation}deg) scale(${scale})`;
    q('#tinterStage').classList.add('smooth-done');
    const drape = q('#smoothDrape');
    if (drape) {
      drape.style.opacity = '.82';
      drape.style.transform = 'translate3d(0,0,0) scaleY(1)';
    }
  }

  function animateTie() {
    q('#tinterTie').disabled = true;
    q('#tinterStage').classList.add('tie-chosen');
    qa('.smooth-card').forEach(card => card.classList.add('is-muted'));
    const drape = q('#smoothDrape');
    if (drape) {
      drape.style.opacity = '0';
      drape.style.transform = 'translate3d(0,0,0) scaleY(0)';
    }
  }

  const setProgress = percent => { q('#tinterBar').style.width = `${clamp(percent, 0, 100)}%`; };
  const setStatus = (text = '') => { q('#tinterStatus').textContent = text; };
  const clearCards = () => q('#smoothDeck').replaceChildren();
  const setDone = (done = true) => q('#tinterCard').classList.toggle('done', done);

  function showSummary(heading) {
    const summary = q('#tinterSummary');
    summary.innerHTML = `<b>${heading}</b><p>Building your palette…</p>`;
    summary.hidden = false;
  }

  function setLightBadge(quality) {
    const badge = q('#tinterLightBadge');
    const key = quality?.key || 'checking';
    badge.dataset.quality = key;
    badge.textContent = key === 'okay' ? 'Lighting fair' : key === 'low' ? 'Improve lighting' : key === 'skipped' ? 'No camera' : '';
    badge.title = quality?.message || 'Checking lighting';
    badge.setAttribute('aria-label', quality?.message || 'Checking lighting');
  }

  const getVideo = () => q('#tinterVideo');
  const getBalance = () => ({
    warmth: Number(q('#tinterWarmth').value) || 0,
    tint: Number(q('#tinterTint').value) || 0
  });

  function setBalance({ warmth = 0, tint = 0 }) {
    q('#tinterWarmth').value = warmth;
    q('#tinterTint').value = tint;
  }

  const setBalanceNote = text => { q('#tinterBalanceNote').textContent = text; };

  function applyFilters({ warmth = 0, tint = 0 }) {
    const warmAlpha = Math.min(.42, Math.abs(warmth) / 190);
    const tintAlpha = Math.min(.28, Math.abs(tint) / 220);
    q('#tinterWarmFilter').style.background = warmth < 0
      ? `rgba(70,120,255,${warmAlpha})`
      : warmth > 0 ? `rgba(255,170,70,${warmAlpha})` : 'transparent';
    q('#tinterTintFilter').style.background = tint < 0
      ? `rgba(60,180,110,${tintAlpha})`
      : tint > 0 ? `rgba(220,80,190,${tintAlpha})` : 'transparent';
  }

  function handleKeydown(event) {
    if (q('#tinterModal')?.hidden) return;
    if (event.key === 'Escape') {
      if (helpOpen) return closeHelp();
      if (settingsOpen) return setSettingsOpen(false);
      onClose({ scrollToResults: false });
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = qa('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])', q('#tinterCard'))
      .filter(element => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    init,
    openModal,
    closeModal,
    setLaunchComplete,
    renderQuestion,
    setInteractionEnabled,
    setProgress,
    setStatus,
    setLightBadge,
    setSettingsOpen,
    closeHelp,
    clearPreview,
    clearCards,
    setDone,
    showSummary,
    animateTie,
    getVideo,
    getBalance,
    setBalance,
    setBalanceNote,
    applyFilters,
    refreshViewport,
    resetCameraFrame,
    isHelpOpen: () => helpOpen,
    isSettingsOpen: () => settingsOpen
  };
}
