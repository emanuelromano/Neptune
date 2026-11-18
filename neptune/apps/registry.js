/*
 * REGISTRO DE APLICACIONES
 * Para añadir una nueva app basta con crear su carpeta, exponer mount() y
 * registrarla aquí. Home no necesita conocer su implementación interna.
 */
export const FEATURED_APP = Object.freeze({
  id: 'clock',
  titleKey: 'app.clock',
  layout: 'square',
  load: () => import('./clock/app.js')
});

export const APPLICATIONS = Object.freeze([
  {
    id: 'calendar',
    titleKey: 'app.calendar',
    icon: 'calendar',
    load: () => import('./calendar/app.js')
  },
  {
    id: 'notes',
    titleKey: 'app.notes',
    icon: 'notes',
    load: () => import('./notes/app.js')
  },
  {
    id: 'contacts',
    titleKey: 'app.contacts',
    icon: 'contacts',
    load: () => import('./contacts/app.js')
  },
  {
    id: 'settings',
    titleKey: 'app.settings',
    icon: 'settings',
    load: () => import('./settings/app.js')
  }
]);
