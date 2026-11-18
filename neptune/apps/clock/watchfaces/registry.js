/* Registro de watchfaces disponibles para la aplicación Reloj. */
export const WATCHFACES = Object.freeze([
  {
    id: 'clock_1',
    nameKey: 'watchface.analog1',
    load: () => import('./clock_1.js')
  },
  {
    id: 'clock_2',
    nameKey: 'watchface.analog2',
    load: () => import('./clock_2.js')
  }
]);

export function getWatchface(id) {
  return WATCHFACES.find((watchface) => watchface.id === id) ?? WATCHFACES[0];
}
