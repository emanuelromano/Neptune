/* Registro de watchfaces disponibles para la aplicación Reloj. */
export const WATCHFACES = Object.freeze([
  {
    id: 'clock_1',
    nameKey: 'watchface.analog',
    load: () => import('./clock_1.js')
  }
]);

export function getWatchface(id) {
  return WATCHFACES.find((watchface) => watchface.id === id) ?? WATCHFACES[0];
}
