/*
 * NAVEGADOR DE APLICACIONES
 * Conserva la animación FLIP compartida: una tarjeta se expande, monta su app
 * y se encoge de vuelta sin que cada módulo tenga que implementar navegación.
 */
import { createInlineIcon } from '../js/components/icons.js';

export function createNavigator(root) {
  let activeSession = null;

  function open(app, card, viewport, tapPoint = null) {
    if (activeSession) return;

    const screen = viewport.closest('.neptune-screen');
    const content = viewport.querySelector('.neptune-list-content');
    if (!screen || !content) return;

    const screenRect = screen.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const scaleX = screenRect.width / screen.clientWidth || 1;
    const scaleY = screenRect.height / screen.clientHeight || 1;
    const margin = Number.parseFloat(getComputedStyle(screen).getPropertyValue('--neptune-app-expand-margin')) || 20;

    const layer = document.createElement('div');
    layer.className = 'neptune-app-expansion-layer';
    const expandedCard = card.cloneNode(true);
    expandedCard.classList.add('neptune-app-expansion-card');
    expandedCard.style.setProperty('--app-expand-start-left', `${(cardRect.left - screenRect.left) / scaleX}px`);
    expandedCard.style.setProperty('--app-expand-start-top', `${(cardRect.top - screenRect.top) / scaleY}px`);
    expandedCard.style.setProperty('--app-expand-start-width', `${cardRect.width / scaleX}px`);
    expandedCard.style.setProperty('--app-expand-start-height', `${cardRect.height / scaleY}px`);
    expandedCard.style.setProperty('--app-expand-target-width', `${screen.clientWidth - margin * 2}px`);
    expandedCard.style.setProperty('--app-expand-target-height', `${screen.clientHeight - margin * 2}px`);
    expandedCard.removeAttribute('tabindex');
    expandedCard.removeAttribute('role');

    const appHost = document.createElement('div');
    appHost.className = 'neptune-app-content';
    expandedCard.append(appHost);

    const session = {
      app,
      card,
      content,
      screen,
      layer,
      expandedCard,
      appHost,
      unmount: () => {},
      closing: false,
      loadVersion: 0
    };
    activeSession = session;
    screen.dataset.activeApp = app.id;
    card.style.visibility = 'hidden';
    content.classList.add('neptune-list-content--expanding');

    const backButton = createBackButton(() => close(session));
    expandedCard.append(backButton);
    layer.append(expandedCard);
    screen.append(layer);

    if (tapPoint) {
      addRipple(
        expandedCard,
        (tapPoint.clientX - cardRect.left) / scaleX,
        (tapPoint.clientY - cardRect.top) / scaleY
      );
    }

    window.requestAnimationFrame(() => expandedCard.classList.add('neptune-app-expansion-card--expanded'));
    mountApp(session);
  }

  async function mountApp(session) {
    const version = ++session.loadVersion;
    const module = await session.app.load();
    if (activeSession !== session || session.closing || version !== session.loadVersion) return;

    session.unmount = module.mount(session.appHost, {
      root,
      app: session.app,
      close: () => close(session)
    }) ?? (() => {});
  }

  function close(session) {
    if (activeSession !== session || session.closing) return;
    session.closing = true;
    session.loadVersion += 1;
    session.unmount();
    session.expandedCard.classList.remove('neptune-app-expansion-card--expanded');
    session.content.classList.remove('neptune-list-content--expanding');

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      session.card.style.visibility = '';
      session.layer.remove();
      delete session.screen.dataset.activeApp;
      activeSession = null;
    };

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      window.requestAnimationFrame(finish);
      return;
    }

    const duration = Math.max(
      ...getComputedStyle(session.expandedCard).transitionDuration.split(',').map(parseCssDuration)
    );
    const fallback = window.setTimeout(finish, duration + 100);
    const onEnd = (event) => {
      if (event.target !== session.expandedCard || event.propertyName !== 'width') return;
      window.clearTimeout(fallback);
      session.expandedCard.removeEventListener('transitionend', onEnd);
      finish();
    };
    session.expandedCard.addEventListener('transitionend', onEnd);
  }

  return { open };
}

function createBackButton(onBack) {
  const button = document.createElement('button');
  button.className = 'neptune-app-back-button';
  button.type = 'button';
  button.setAttribute('aria-label', 'Volver a la lista de aplicaciones');
  button.append(createInlineIcon('arrow-back', 'neptune-app-back-icon'));
  button.addEventListener('click', onBack);
  return button;
}

function addRipple(host, x, y) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const ripple = document.createElement('span');
  ripple.className = 'neptune-ripple';
  const diameter = Math.hypot(Math.max(x, host.clientWidth - x), Math.max(y, host.clientHeight - y)) * 1.35;
  ripple.style.width = `${diameter}px`;
  ripple.style.height = `${diameter}px`;
  ripple.style.left = `${x - diameter / 2}px`;
  ripple.style.top = `${y - diameter / 2}px`;
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  host.append(ripple);
}

function parseCssDuration(value) {
  const duration = Number.parseFloat(value);
  return value.trim().endsWith('ms') ? duration : duration * 1000;
}
