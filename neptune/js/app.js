import { createAppShell } from './components/app-shell.js';
import { createHomeScreen } from './screens/home.js';
import { createNeptuneState } from './state.js';
import { applyTheme } from './theme.js';

const mountPoint = document.getElementById('neptune-app');

if (mountPoint) {
  const state = createNeptuneState();
  // Aplica el tema persistido antes del primer render, sin animación inicial.
  applyTheme(mountPoint, state.theme, { persist: false, animate: false });
  const appShell = createAppShell(state);

  if (state.screen === 'home') {
    appShell.append(createHomeScreen());
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
