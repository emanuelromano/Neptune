/*
 * REGISTRO DE APLICACIONES
 * Para añadir una nueva app basta con crear su carpeta, exponer mount() y
 * registrarla aquí. Home no necesita conocer su implementación interna.
 */
export const FEATURED_APP = Object.freeze({
  id: 'clock',
  title: 'Reloj',
  layout: 'square',
  load: () => import('./clock/app.js')
});

export const APPLICATIONS = Object.freeze([
  {
    id: 'calendar',
    title: 'Calendario',
    icon: 'calendar',
    load: () => import('./calendar/app.js')
  },
  {
    id: 'notes',
    title: 'Notas',
    icon: 'notes',
    load: () => import('./notes/app.js')
  },
  {
    id: 'contacts',
    title: 'Contactos',
    icon: 'contacts',
    load: () => import('./contacts/app.js')
  },
  {
    id: 'settings',
    title: 'Configuración',
    icon: 'settings',
    load: () => import('./settings/app.js')
  }
]);
