/*
 * ARRANQUE DE NEPTUNE
 * Precarga todos los recursos de ejecución antes de montar la interfaz.
 * Cada recurso completado avanza la barra; un fallo muestra Reintentar.
 */
import { getPreferences } from '../core/preferences.js';
import { WALLPAPERS } from '../core/wallpapers.js';
import { APPLICATIONS, FEATURED_APP } from '../apps/registry.js';
import { WATCHFACES } from '../apps/clock/watchfaces/registry.js';
import { t } from '../i18n/index.js';

const boot = document.getElementById('neptune-boot');
const progress = boot.querySelector('.neptune-boot-progress-fill');
const errorCard = boot.querySelector('.neptune-boot-error');
const errorMessage = boot.querySelector('.neptune-boot-error-message');
const retryButton = boot.querySelector('.neptune-boot-retry');
const controls = document.getElementById('controls');

const ICON_NAMES = ['calendar', 'notes', 'contacts', 'settings', 'arrow_back', 'arrow_drop_down', 'error'];
const imageUrls = [
  ...WALLPAPERS.flatMap(({ image, thumbnail }) => [image, thumbnail]),
  ...ICON_NAMES.map((name) => new URL(`../assets/icons/${name}.svg`, import.meta.url).href)
];
const fileUrls = [
  new URL('../assets/fonts/DMSerifDisplay-Regular.ttf', import.meta.url).href,
  new URL('../../css/styles.css', import.meta.url).href,
  new URL('../css/neptune.css', import.meta.url).href,
  new URL('../css/boot.css', import.meta.url).href
];
const moduleLoaders = [
  () => FEATURED_APP.load(),
  ...APPLICATIONS.map((app) => () => app.load()),
  ...WATCHFACES.map((watchface) => () => watchface.load()),
  () => import('../../js/script.js')
];

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    image.src = url;
  });
}

async function preloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo cargar ${url}: ${response.status}`);
  await response.arrayBuffer();
}

async function start() {
  controls.inert = true;
  const preferences = getPreferences();
  document.documentElement.dataset.neptuneBootTheme = preferences.theme === 'dark' ? 'dark' : 'light';
  document.documentElement.style.setProperty('--neptune-boot-accent', preferences.accentColor);
  boot.setAttribute('aria-label', t('boot.loading'));
  errorCard.hidden = true;
  errorCard.classList.remove('neptune-boot-error--visible');
  progress.style.width = '0%';

  const tasks = [
    ...imageUrls.map((url) => () => preloadImage(url)),
    ...fileUrls.map((url) => () => preloadFile(url)),
    ...moduleLoaders
  ];
  let completed = 0;
  const results = await Promise.allSettled(tasks.map(async (load) => {
    await load();
    completed += 1;
    progress.style.width = `${(completed / (tasks.length + 1)) * 100}%`;
  }));

  const failure = results.find(({ status }) => status === 'rejected');
  if (failure) {
    console.error('Neptune: falló la precarga de recursos.', failure.reason);
    showError();
    return;
  }

  try {
    // La última unidad de progreso monta la interfaz principal ya precargada.
    await import('./app.js');
    await document.fonts.ready;
    progress.style.width = '100%';
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    boot.classList.add('neptune-boot--finished');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      controls.inert = false;
      boot.remove();
    };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finish();
    } else {
      boot.addEventListener('transitionend', (event) => {
        if (event.target === boot && event.propertyName === 'opacity') finish();
      }, { once: true });
      // Safari y algunos entornos embebidos pueden omitir transitionend.
      window.setTimeout(finish, 500);
    }
  } catch (error) {
    console.error('Neptune: falló el montaje de la interfaz.', error);
    showError();
  }
}

function showError() {
  boot.setAttribute('aria-label', t('boot.error'));
  errorMessage.textContent = t('boot.error');
  retryButton.textContent = t('boot.retry');
  errorCard.hidden = false;
  requestAnimationFrame(() => errorCard.classList.add('neptune-boot-error--visible'));
}

retryButton.addEventListener('click', () => window.location.reload());
start();
