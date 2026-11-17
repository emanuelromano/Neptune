import { createClock } from './clock_1.js';

const ICONS_DIRECTORY_URL = new URL('../../assets/icons/', import.meta.url);

/*
 * AJUSTES DE GESTOS — modifica estos valores para calibrar el tacto de la lista.
 * Las dimensiones, sombras y duración visual del rebote están en neptune.css.
 */

// Píxeles necesarios antes de considerar que un toque se convirtió en arrastre.
const DRAG_THRESHOLD = 3;

// --- Rebote en los extremos ---
// Máxima distancia visual (px) que puede estirarse la lista sobre un borde.
const MAX_OVERSCROLL = 60;
// Resistencia del borde: menor = más duro; mayor = se estira más fácilmente.
const OVERSCROLL_RESISTANCE = 1.50;
// Debe ser apenas mayor que la duración CSS del rebote (600 ms) para limpiarlo.
const OVERSCROLL_CLEANUP_DELAY = 650;

// --- Inercia al soltar ---
// Tasa de desaceleración exponencial (por ms): mayor = frena antes; menor =
// una cola más larga y natural. Es el control principal de suavidad de inercia.
const MOMENTUM_DECELERATION_RATE = 0.0015;
// Multiplicador de la velocidad inicial: mayor = recorre más distancia.
const MOMENTUM_BOOST = 1.15;
// Velocidad mínima (px/ms) antes de detener la inercia: mayor = para antes.
// Este valor bajo evita que el último tramo se corte de forma perceptible.
const MIN_MOMENTUM_VELOCITY = 0.002;
// Pesos para medir la velocidad: prioriza el tramo más reciente del gesto.
const VELOCITY_HISTORY_WEIGHT = 0.6;
const VELOCITY_RECENT_WEIGHT = 0.4;
// Evita saltos de física si el navegador tarda en entregar un fotograma.
const MAX_FRAME_TIME = 32;
// Mantiene desactivado el blur mientras el desplazamiento nativo está activo.
const SCROLLING_STATE_TIMEOUT = 120;
const KEYBOARD_SCROLL_STEP = 48;

/**
 * Crea una lista desplazable por arrastre de un dedo o clic sostenido.
 * El desplazamiento extra en los bordes se transforma en una respuesta elástica.
 */
export function createItemList(items) {
  const viewport = document.createElement('div');
  viewport.className = 'neptune-list-viewport';
  viewport.setAttribute('aria-label', 'Lista de items');
  viewport.setAttribute('role', 'region');
  viewport.tabIndex = 0;

  const content = document.createElement('div');
  content.className = 'neptune-list-content';

  // CUADRADO DESTACADO: aparece antes de "Item 1" al inicio de la lista.
  const featuredSquare = document.createElement('div');
  featuredSquare.className = 'neptune-featured-square';
  featuredSquare.append(createClock());
  content.append(featuredSquare);

  // ENTIDADES DE APLICACIÓN: cada tarjeta conserva su id para la futura vista
  // ampliada y obtiene su texto e icono desde NEPTUNE_APPS en screens/home.js.
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'neptune-item-card';
    card.dataset.appId = item.id;
    const icon = document.createElement('img');
    icon.className = 'neptune-item-icon';
    icon.src = new URL(item.icon, ICONS_DIRECTORY_URL).href;
    icon.alt = '';

    const itemLabel = document.createElement('span');
    itemLabel.className = 'neptune-item-label';
    itemLabel.textContent = item.label;

    card.append(icon, itemLabel);
    content.append(card);
  });

  viewport.append(content);
  enableDragScroll(viewport, content);

  return viewport;
}

function enableDragScroll(viewport, content) {
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

  function maxScrollTop() {
    return cachedMaxScrollTop;
  }

  function refreshMaxScrollTop() {
    cachedMaxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  }

  function setScrollingState() {
    viewport.classList.add('neptune-list-viewport--scrolling');
    window.clearTimeout(scrollingStateTimer);
    scrollingStateTimer = window.setTimeout(() => {
      viewport.classList.remove('neptune-list-viewport--scrolling');
    }, SCROLLING_STATE_TIMEOUT);
  }

  function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  function setElasticOffset(offset) {
    elasticOffset = offset;
    content.style.transform = `translateY(${offset}px)`;
  }

  function scrollToPosition(nextScrollTop) {
    const maximum = maxScrollTop();

    if (nextScrollTop < 0) {
      viewport.scrollTop = 0;
      setElasticOffset(Math.min(MAX_OVERSCROLL, -nextScrollTop * OVERSCROLL_RESISTANCE));
      setScrollingState();
      return;
    }

    if (nextScrollTop > maximum) {
      viewport.scrollTop = maximum;
      setElasticOffset(-Math.min(MAX_OVERSCROLL, (nextScrollTop - maximum) * OVERSCROLL_RESISTANCE));
      setScrollingState();
      return;
    }

    viewport.scrollTop = nextScrollTop;
    setElasticOffset(0);
    setScrollingState();
  }

  function clearPendingSettle() {
    window.clearTimeout(settleTimer);
    settleTimer = null;

    if (settleFrame !== null) {
      window.cancelAnimationFrame(settleFrame);
      settleFrame = null;
    }
  }

  function settleOverscroll(deferUntilNextFrame = false) {
    clearPendingSettle();

    const startSettling = () => {
      content.classList.add('neptune-list-content--settling');
      setElasticOffset(0);
      settleTimer = window.setTimeout(() => {
        content.classList.remove('neptune-list-content--settling');
        content.style.transform = '';
      }, OVERSCROLL_CLEANUP_DELAY);
    };

    if (deferUntilNextFrame) {
      settleFrame = window.requestAnimationFrame(() => {
        // Deja que el estiramiento se pinte antes de iniciar el retorno.
        settleFrame = window.requestAnimationFrame(() => {
          settleFrame = null;
          startSettling();
        });
      });
    } else {
      startSettling();
    }
  }

  function stopMomentum() {
    if (momentumFrame !== null) {
      window.cancelAnimationFrame(momentumFrame);
      momentumFrame = null;
    }
  }

  function startMomentum() {
    velocity *= MOMENTUM_BOOST;
    let previousTime = performance.now();

    function animate(currentTime) {
      const elapsed = Math.min(currentTime - previousTime, MAX_FRAME_TIME);
      previousTime = currentTime;
      const nextPosition = viewport.scrollTop + velocity * elapsed;
      const maximum = maxScrollTop();

      // Al alcanzar un límite, muestra el último tramo elástico y rebota.
      if (nextPosition < 0 || nextPosition > maximum) {
        scrollToPosition(nextPosition);
        momentumFrame = null;
        // El exceso se pinta primero; la vuelta ocurre en el siguiente frame.
        settleOverscroll(true);
        return;
      }

      scrollToPosition(nextPosition);
      // Desaceleración exponencial continua, como una lista táctil nativa.
      velocity *= Math.exp(-MOMENTUM_DECELERATION_RATE * elapsed);

      if (Math.abs(velocity) < MIN_MOMENTUM_VELOCITY) {
        momentumFrame = null;
        settleOverscroll();
        return;
      }

      momentumFrame = window.requestAnimationFrame(animate);
    }

    momentumFrame = window.requestAnimationFrame(animate);
  }

  function finishDrag(event) {
    if (event.pointerId !== activePointerId) return;

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    activePointerId = null;
    viewport.classList.remove('neptune-list-viewport--dragging');

    // Si el usuario ya estiró el borde, conserva esa posición y deja que la
    // transición elástica la lleve de vuelta. No la sustituye por la inercia.
    if (Math.abs(elasticOffset) > 0) {
      settleOverscroll(true);
    } else if (
      !prefersReducedMotion() &&
      hasDragged &&
      Math.abs(velocity) >= MIN_MOMENTUM_VELOCITY
    ) {
      startMomentum();
    } else {
      settleOverscroll(true);
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
    hasDragged = false;
    lastY = event.clientY;
    lastMoveTime = event.timeStamp;
    velocity = 0;
    refreshMaxScrollTop();
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('neptune-list-viewport--dragging');
  });

  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerId !== activePointerId) return;

    const distance = startY - event.clientY;
    hasDragged ||= Math.abs(distance) >= DRAG_THRESHOLD;

    if (hasDragged) {
      const elapsed = Math.max(1, event.timeStamp - lastMoveTime);
      const movement = lastY - event.clientY;
      const measuredVelocity = movement / elapsed;

      velocity =
        velocity * VELOCITY_HISTORY_WEIGHT + measuredVelocity * VELOCITY_RECENT_WEIGHT;
      lastY = event.clientY;
      lastMoveTime = event.timeStamp;
      event.preventDefault();
      scrollToPosition(startScrollTop + distance);
    }
  });

  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);

  viewport.addEventListener(
    'wheel',
    (event) => {
      stopMomentum();
      event.preventDefault();
      refreshMaxScrollTop();
      scrollToPosition(viewport.scrollTop + event.deltaY);
      settleOverscroll();
    },
    { passive: false }
  );

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      refreshMaxScrollTop();
      scrollToPosition(
        viewport.scrollTop + (event.key === 'ArrowDown' ? KEYBOARD_SCROLL_STEP : -KEYBOARD_SCROLL_STEP)
      );
      settleOverscroll();
    }
  });

  // Listener pasivo: no bloquea la entrega de eventos en Safari ni Chromium.
  viewport.addEventListener('scroll', setScrollingState, { passive: true });
}

