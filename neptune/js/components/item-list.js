/*
 * LISTA DE APLICACIONES
 * Renderiza el catálogo definido en apps/registry.js. La navegación y las
 * apps concretas viven fuera de este componente para mantenerlo reutilizable.
 */
import { createInlineIcon } from './icons.js';

const DRAG_THRESHOLD = 3;
const MAX_OVERSCROLL = 60;
const OVERSCROLL_RESISTANCE = 1.5;
const OVERSCROLL_CLEANUP_DELAY = 650;
const MOMENTUM_DECELERATION_RATE = 0.0015;
const MOMENTUM_BOOST = 1.15;
const MIN_MOMENTUM_VELOCITY = 0.002;
const VELOCITY_HISTORY_WEIGHT = 0.6;
const VELOCITY_RECENT_WEIGHT = 0.4;
const MAX_FRAME_TIME = 32;
const KEYBOARD_SCROLL_STEP = 48;
const TAP_LOCK_AFTER_DRAG = 250;
// Alcance final del ripple: 45 % menor que la versión anterior (1.35).
const RIPPLE_DIAMETER_MULTIPLIER = 0.7425;

export function createAppList({ featuredApp, apps, navigator, root }) {
  const viewport = document.createElement('div');
  viewport.className = 'neptune-list-viewport';
  viewport.setAttribute('aria-label', 'Lista de aplicaciones');
  viewport.setAttribute('role', 'region');
  viewport.tabIndex = 0;

  const content = document.createElement('div');
  content.className = 'neptune-list-content';
  const featuredSquare = document.createElement('div');
  featuredSquare.className = 'neptune-featured-square';
  const featuredHost = document.createElement('div');
  featuredHost.className = 'neptune-featured-app-host';
  featuredSquare.append(featuredHost);
  content.append(featuredSquare);

  // Clock es una app featured: mantiene su tarjeta cuadrada pero se monta aparte.
  featuredApp.load().then((module) => {
    module.mount(featuredHost, { root, app: featuredApp });
  });

  apps.forEach((app) => content.append(createAppCard(app, viewport, navigator)));
  viewport.append(content);
  enableDragScroll(viewport, content, navigator, apps);
  return viewport;
}

function createAppCard(app, viewport, navigator) {
  const card = document.createElement('article');
  card.className = 'neptune-item-card';
  card.dataset.appId = app.id;
  card.setAttribute('role', 'button');
  card.tabIndex = 0;
  card.setAttribute('aria-label', `Abrir ${app.title}`);
  card.append(createInlineIcon(app.icon, 'neptune-item-icon'));

  const label = document.createElement('span');
  label.className = 'neptune-item-label';
  label.textContent = app.title;
  card.append(label);

  card.addEventListener('click', (event) => {
    const tapLockUntil = Number(viewport.dataset.neptuneTapLockUntil ?? 0);
    if (performance.now() >= tapLockUntil) {
      navigator.open(app, card, viewport, { clientX: event.clientX, clientY: event.clientY });
    }
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigator.open(app, card, viewport);
    }
  });
  return card;
}

function enableDragScroll(viewport, content, navigator, apps) {
  let activePointerId = null;
  let startY = 0;
  let startScrollTop = 0;
  let hasDragged = false;
  let lastY = 0;
  let lastMoveTime = 0;
  let velocity = 0;
  let elasticOffset = 0;
  let settleTimer = null;
  let settleFrame = null;
  let momentumFrame = null;
  let cachedMaxScrollTop = 0;
  let scrollingStateTimer = null;

  function refreshMaxScrollTop() {
    cachedMaxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  }

  function setScrollingState() {
    viewport.classList.add('neptune-list-viewport--scrolling');
    window.clearTimeout(scrollingStateTimer);
    scrollingStateTimer = window.setTimeout(() => {
      viewport.classList.remove('neptune-list-viewport--scrolling');
    }, 120);
  }

  function setElasticOffset(offset) {
    elasticOffset = offset;
    content.style.transform = `translateY(${offset}px)`;
  }

  function scrollToPosition(nextPosition) {
    if (nextPosition < 0) {
      viewport.scrollTop = 0;
      setElasticOffset(Math.min(MAX_OVERSCROLL, -nextPosition * OVERSCROLL_RESISTANCE));
    } else if (nextPosition > cachedMaxScrollTop) {
      viewport.scrollTop = cachedMaxScrollTop;
      setElasticOffset(-Math.min(MAX_OVERSCROLL, (nextPosition - cachedMaxScrollTop) * OVERSCROLL_RESISTANCE));
    } else {
      viewport.scrollTop = nextPosition;
      setElasticOffset(0);
    }
    setScrollingState();
  }

  function clearPendingSettle() {
    window.clearTimeout(settleTimer);
    if (settleFrame !== null) window.cancelAnimationFrame(settleFrame);
    settleFrame = null;
  }

  function settleOverscroll(defer = false) {
    clearPendingSettle();
    const start = () => {
      content.classList.add('neptune-list-content--settling');
      setElasticOffset(0);
      settleTimer = window.setTimeout(() => {
        content.classList.remove('neptune-list-content--settling');
        content.style.transform = '';
      }, OVERSCROLL_CLEANUP_DELAY);
    };
    if (defer) {
      settleFrame = window.requestAnimationFrame(() => {
        settleFrame = window.requestAnimationFrame(() => {
          settleFrame = null;
          start();
        });
      });
    } else {
      start();
    }
  }

  function stopMomentum() {
    if (momentumFrame !== null) window.cancelAnimationFrame(momentumFrame);
    momentumFrame = null;
  }

  function startMomentum() {
    velocity *= MOMENTUM_BOOST;
    let previousTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = Math.min(currentTime - previousTime, MAX_FRAME_TIME);
      previousTime = currentTime;
      const nextPosition = viewport.scrollTop + velocity * elapsed;
      if (nextPosition < 0 || nextPosition > cachedMaxScrollTop) {
        scrollToPosition(nextPosition);
        momentumFrame = null;
        settleOverscroll(true);
        return;
      }
      scrollToPosition(nextPosition);
      velocity *= Math.exp(-MOMENTUM_DECELERATION_RATE * elapsed);
      if (Math.abs(velocity) < MIN_MOMENTUM_VELOCITY) {
        momentumFrame = null;
        settleOverscroll();
        return;
      }
      momentumFrame = window.requestAnimationFrame(animate);
    };
    momentumFrame = window.requestAnimationFrame(animate);
  }

  function finishDrag(event) {
    if (event.pointerId !== activePointerId) return;
    const wasTap = event.type === 'pointerup' && !hasDragged;
    const target = wasTap ? document.elementFromPoint(event.clientX, event.clientY) : null;
    const card = target?.closest('.neptune-item-card');
    const rippleHost = target?.closest('.neptune-item-card, .neptune-featured-square');

    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    activePointerId = null;
    viewport.classList.remove('neptune-list-viewport--dragging');
    if (hasDragged) viewport.dataset.neptuneTapLockUntil = String(performance.now() + TAP_LOCK_AFTER_DRAG);

    if (Math.abs(elasticOffset) > 0) {
      settleOverscroll(true);
    } else if (!prefersReducedMotion() && hasDragged && Math.abs(velocity) >= MIN_MOMENTUM_VELOCITY) {
      startMomentum();
    } else {
      settleOverscroll(true);
    }

    if (card && viewport.contains(card)) {
      const app = apps.find((candidate) => candidate.id === card.dataset.appId);
      if (app) window.requestAnimationFrame(() => navigator.open(app, card, viewport, event));
    } else if (rippleHost && viewport.contains(rippleHost)) {
      addRippleFromPoint(rippleHost, event.clientX, event.clientY);
    }
  }

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stopMomentum();
    clearPendingSettle();
    content.classList.remove('neptune-list-content--settling');
    activePointerId = event.pointerId;
    startY = event.clientY;
    startScrollTop = viewport.scrollTop;
    lastY = event.clientY;
    lastMoveTime = event.timeStamp;
    hasDragged = false;
    velocity = 0;
    refreshMaxScrollTop();
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('neptune-list-viewport--dragging');
  });

  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerId !== activePointerId) return;
    const distance = startY - event.clientY;
    hasDragged ||= Math.abs(distance) >= DRAG_THRESHOLD;
    if (!hasDragged) return;
    const elapsed = Math.max(1, event.timeStamp - lastMoveTime);
    const measuredVelocity = (lastY - event.clientY) / elapsed;
    velocity = velocity * VELOCITY_HISTORY_WEIGHT + measuredVelocity * VELOCITY_RECENT_WEIGHT;
    lastY = event.clientY;
    lastMoveTime = event.timeStamp;
    event.preventDefault();
    scrollToPosition(startScrollTop + distance);
  });

  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);
  viewport.addEventListener('wheel', (event) => {
    stopMomentum();
    event.preventDefault();
    refreshMaxScrollTop();
    scrollToPosition(viewport.scrollTop + event.deltaY);
    settleOverscroll();
  }, { passive: false });
  viewport.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    refreshMaxScrollTop();
    scrollToPosition(viewport.scrollTop + (event.key === 'ArrowDown' ? KEYBOARD_SCROLL_STEP : -KEYBOARD_SCROLL_STEP));
    settleOverscroll();
  });
  viewport.addEventListener('scroll', setScrollingState, { passive: true });
}

function addRippleFromPoint(host, clientX, clientY) {
  const rect = host.getBoundingClientRect();
  const scaleX = rect.width / host.clientWidth || 1;
  const scaleY = rect.height / host.clientHeight || 1;
  addRipple(host, (clientX - rect.left) / scaleX, (clientY - rect.top) / scaleY);
}

function addRipple(host, x, y) {
  if (prefersReducedMotion()) return;
  const ripple = document.createElement('span');
  ripple.className = 'neptune-ripple';
  const diameter = Math.hypot(Math.max(x, host.clientWidth - x), Math.max(y, host.clientHeight - y)) * RIPPLE_DIAMETER_MULTIPLIER;
  ripple.style.width = `${diameter}px`;
  ripple.style.height = `${diameter}px`;
  ripple.style.left = `${x - diameter / 2}px`;
  ripple.style.top = `${y - diameter / 2}px`;
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  host.append(ripple);
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
