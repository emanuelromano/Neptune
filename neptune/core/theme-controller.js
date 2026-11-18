/*
 * CONTROLADOR DE TEMA
 * Traduce la preferencia global de tema a tokens CSS y aplica un fade breve
 * cada vez que el usuario alterna entre claro y oscuro.
 */
import { subscribePreferences } from './preferences.js';

export function mountThemeController(root) {
  return subscribePreferences((preferences, previousPreferences) => {
    const themeChanged = preferences.theme !== previousPreferences.theme;

    if (themeChanged && !preferences.reduceMotion) {
      root.classList.add('neptune-theme-fading');
      window.setTimeout(() => {
        applyThemeTokens(root, preferences);
        window.requestAnimationFrame(() => root.classList.remove('neptune-theme-fading'));
      }, 150);
    } else {
      applyThemeTokens(root, preferences);
    }

  });
}

export function applyThemeTokens(root, preferences) {
  root.dataset.theme = preferences.theme;
  root.style.setProperty('--neptune-font-scale', preferences.fontScale);
  root.dataset.reduceMotion = String(preferences.reduceMotion);
}
