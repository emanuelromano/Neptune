/* Cambia el fondo con una capa saliente para hacer crossfade sin mover el encuadre. */
import { subscribePreferences } from './preferences.js';
import { getWallpaper } from './wallpapers.js';

export function mountWallpaperController(root, screen, initialPreferences) {
  let current = getWallpaper(initialPreferences.wallpaper).id;
  let outgoing = null;
  let fadeTimer = null;
  root.style.setProperty('--neptune-wallpaper-image', `url("${getWallpaper(current).image}")`);

  const unsubscribe = subscribePreferences((next) => {
    const selected = getWallpaper(next.wallpaper).id;
    if (selected === current) return;

    outgoing?.remove();
    window.clearTimeout(fadeTimer);
    const previous = current;
    current = selected;

    if (!next.reduceMotion && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      outgoing = document.createElement('div');
      outgoing.className = 'neptune-wallpaper-outgoing';
      outgoing.style.backgroundImage = `url("${getWallpaper(previous).image}")`;
      screen.prepend(outgoing);
    }

    root.style.setProperty('--neptune-wallpaper-image', `url("${getWallpaper(selected).image}")`);
    if (outgoing) {
      const layer = outgoing;
      // Dos frames permiten pintar la imagen saliente antes de iniciar su fade.
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        if (outgoing === layer) layer.classList.add('neptune-wallpaper-outgoing--fading');
      }));
      fadeTimer = window.setTimeout(() => {
        layer.remove();
        if (outgoing === layer) outgoing = null;
      }, 420);
    }
  });

  return () => {
    unsubscribe();
    window.clearTimeout(fadeTimer);
    outgoing?.remove();
  };
}
