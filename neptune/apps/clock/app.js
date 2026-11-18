/*
 * APLICACIÓN RELOJ
 * Monta la watchface elegida en preferencias y la reemplaza en vivo cuando
 * Configuración cambia selectedWatchface.
 */
import { getPreferences, subscribePreferences } from '../../core/preferences.js';
import { getWatchface } from './watchfaces/registry.js';

export function mount(container, context) {
  let unmountWatchface = () => {};
  let renderVersion = 0;

  async function renderWatchface(id) {
    const currentVersion = ++renderVersion;
    const watchface = getWatchface(id);
    unmountWatchface();
    container.replaceChildren();

    const module = await watchface.load();
    if (currentVersion !== renderVersion) return;

    unmountWatchface = module.mount(container, context) ?? (() => {});
  }

  renderWatchface(getPreferences().selectedWatchface);
  const unsubscribe = subscribePreferences((next, previous) => {
    if (next.selectedWatchface !== previous.selectedWatchface) {
      renderWatchface(next.selectedWatchface);
    }
  });

  return () => {
    renderVersion += 1;
    unsubscribe();
    unmountWatchface();
    container.replaceChildren();
  };
}
