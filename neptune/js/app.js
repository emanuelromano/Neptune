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
}
