/*
 * PREFERENCIAS GLOBALES
 * Todas las apps leen y actualizan este store. Las opciones se persisten en
 * localStorage y los suscriptores reciben cambios inmediatamente.
 */
const STORAGE_KEY = 'neptune-preferences';

const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'light',
  fontScale: 1,
  reduceMotion: false,
  selectedWatchface: 'clock_1',
  // Color compartido por los componentes que adopten el acento del sistema.
  accentColor: '#ff3b30'
});

const subscribers = new Set();
let preferences = readPreferences();

export function getPreferences() {
  return { ...preferences };
}

export function updatePreferences(partialPreferences) {
  const previousPreferences = preferences;
  preferences = { ...preferences, ...partialPreferences };
  persistPreferences();

  subscribers.forEach((subscriber) => subscriber(getPreferences(), { ...previousPreferences }));
}

export function subscribePreferences(subscriber) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) return { ...DEFAULT_PREFERENCES, ...saved };

    // Conserva el tema elegido por la versión anterior de Neptune, si existe.
    const legacyTheme = localStorage.getItem('neptune-theme');
    return {
      ...DEFAULT_PREFERENCES,
      theme: legacyTheme === 'dark' ? 'dark' : 'light'
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

function persistPreferences() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Neptune continúa funcionando si el navegador no permite almacenamiento.
  }
}
