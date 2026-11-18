import { createAppShell } from './components/app-shell.js';
import { createHomeScreen } from './screens/home.js';
import { createNeptuneState } from './state.js';
import { applyThemeTokens, mountThemeController } from '../core/theme-controller.js';

const mountPoint = document.getElementById('neptune-app');

if (mountPoint) {
  const state = createNeptuneState();
  // Aplica preferencias persistidas antes del primer render y luego las observa.
  applyThemeTokens(mountPoint, state.preferences);
  mountThemeController(mountPoint);
  const appShell = createAppShell(state);

  if (state.screen === 'home') {
    appShell.append(createHomeScreen(mountPoint));
  }

  mountPoint.replaceChildren(appShell);

  // WebKit puede omitir el primer backdrop-filter si se activa antes de pintar.
  // Dos frames aseguran que el wallpaper exista detrás antes de activar el vidrio.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      mountPoint.classList.add('neptune-glass-ready');
    });
  });
}
