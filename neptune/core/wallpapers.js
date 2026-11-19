/* Catálogo único de fondos: cada imagen completa tiene su miniatura homónima. */
export const WALLPAPERS = Object.freeze(
  Array.from({ length: 8 }, (_, index) => {
    const number = index + 1;
    return Object.freeze({
      id: `background_${number}`,
      image: new URL(`../assets/backgrounds/background_${number}.png`, import.meta.url).href,
      thumbnail: new URL(`../assets/backgrounds/background_${number}_thumb.png`, import.meta.url).href
    });
  })
);

export function getWallpaper(id) {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPERS[0];
}
