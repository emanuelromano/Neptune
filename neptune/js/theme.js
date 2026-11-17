/*
 * GESTOR DE TEMA
 * Centraliza el modo claro/oscuro, lo persiste y avisa a los componentes
 * (reloj, panel de configuración, etc.) cuando el tema cambia.
 */
export const THEME_CHANGE_EVENT = 'neptune:themechange';

const THEME_STORAGE_KEY = 'neptune-theme';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

export function getPersistedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === DARK_THEME ? DARK_THEME : LIGHT_THEME;
  } catch {
    return LIGHT_THEME;
  }
}

export function applyTheme(root, theme, { persist = true, animate = true } = {}) {
  const nextTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;

  const commitTheme = () => {
    root.dataset.theme = nextTheme;

    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // La interfaz funciona aunque el navegador bloquee localStorage.
      }
    }

    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: nextTheme } }));
  };

  if (!animate) {
    commitTheme();
    return;
  }

  // Fade-out breve, cambio de tokens, y fade-in de la interfaz completa.
  root.classList.add('neptune-theme-fading');
  window.setTimeout(() => {
    commitTheme();
    window.requestAnimationFrame(() => root.classList.remove('neptune-theme-fading'));
  }, 150);
}

export function toggleTheme(root) {
  const nextTheme = root.dataset.theme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
  applyTheme(root, nextTheme);
}
