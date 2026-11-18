import { APPLICATIONS, FEATURED_APP } from '../../apps/registry.js';
import { createNavigator } from '../../core/navigator.js';
import { createAppList } from '../components/item-list.js';

export function createHomeScreen(root) {
  const screen = document.createElement('section');
  screen.className = 'neptune-screen neptune-home';
  screen.setAttribute('aria-label', 'Inicio');
  const navigator = createNavigator(root);
  screen.append(createAppList({
    featuredApp: FEATURED_APP,
    apps: APPLICATIONS,
    navigator,
    root
  }));

  return screen;
}
