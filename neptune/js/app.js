import { createAppShell } from './components/app-shell.js';
import { createHomeScreen } from './screens/home.js';
import { createNeptuneState } from './state.js';

const mountPoint = document.getElementById('neptune-app');

if (mountPoint) {
  const state = createNeptuneState();
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
