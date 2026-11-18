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
  // Expone la preferencia persistente como token CSS para toda la interfaz.
  root.style.setProperty('--neptune-accent-color', preferences.accentColor);
  // Garantiza texto legible sobre cualquier acento, incluido amarillo y azul claro.
  root.style.setProperty('--neptune-accent-contrast-color', getAccentContrastColor(preferences.accentColor));
  // Ripple semitransparente del mismo acento, aplicado a tarjetas y reloj.
  root.style.setProperty('--neptune-ripple-color', getAccentRippleColor(preferences.accentColor));
  root.dataset.reduceMotion = String(preferences.reduceMotion);
}

function getAccentContrastColor(color) {
  const hex = getNormalizedAccentHex(color);

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
  return brightness >= 150 ? '#111111' : '#ffffff';
}

function getAccentRippleColor(color) {
  const hex = getNormalizedAccentHex(color);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgb(${red} ${green} ${blue} / 30%)`;
}

function getNormalizedAccentHex(color) {
  const hex = String(color).replace('#', '');
  return /^[\da-f]{6}$/i.test(hex) ? hex : 'ff3b30';
}
