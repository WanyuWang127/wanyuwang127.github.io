(() => {
  'use strict';

  const navLinks = [...document.querySelectorAll('.navigation a')];
  const sections = navLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
  let scheduled = false;

  function updateNavigation() {
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 100) current = section;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6) {
      const anchor = sections.find((section) => `#${section.id}` === window.location.hash);
      current = anchor?.getBoundingClientRect().top >= 0 ? anchor : sections[sections.length - 1];
    }
    for (const link of navLinks) {
      if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    scheduled = false;
  }

  function scheduleNavigation() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateNavigation);
    }
  }

  window.addEventListener('scroll', scheduleNavigation, { passive: true });
  window.addEventListener('resize', scheduleNavigation, { passive: true });
  window.addEventListener('hashchange', scheduleNavigation);
  updateNavigation();
  document.getElementById('copyright-year').textContent = new Date().getFullYear();

  const dialog = document.getElementById('figure-dialog');
  // Keep original-image links functional without native dialog support or JavaScript.
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const figureImage = document.getElementById('figure-image');
  let figureTrigger = null;
  let pointerStartedOutside = false;

  for (const link of document.querySelectorAll('.publication-figure')) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'figure-dialog');
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      figureTrigger = link;
      const { figureTitle, figureLabel, figureCaption, figureSource } = link.dataset;
      document.getElementById('figure-title').textContent = figureTitle;
      document.getElementById('figure-label').textContent = figureLabel;
      document.getElementById('figure-caption').textContent = figureCaption;
      figureImage.src = link.href;
      figureImage.alt = link.querySelector('img').alt;
      document.getElementById('figure-source').href = figureSource;
      document.getElementById('figure-paper').href = link.closest('.publication').querySelector('.paper-title a').href;
      document.getElementById('figure-original').href = link.href;
      dialog.showModal();
      document.documentElement.classList.add('figure-open');
    });
  }

  dialog.querySelector('.figure-close').addEventListener('click', () => dialog.close());
  function isOutsideDialog(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  dialog.addEventListener('pointerdown', (event) => {
    pointerStartedOutside = isOutsideDialog(event);
  });
  dialog.addEventListener('click', (event) => {
    if (pointerStartedOutside && isOutsideDialog(event)) dialog.close();
    pointerStartedOutside = false;
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('figure-open');
    if (figureTrigger) figureTrigger.focus({ preventScroll: true });
  });
})();
