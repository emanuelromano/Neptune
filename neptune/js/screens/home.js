import { createItemList } from '../components/item-list.js';

/*
 * APLICACIONES DE NEPTUNE: cada objeto representa una tarjeta y, más adelante,
 * su propia mini ventana a pantalla completa. Edita aquí el id, nombre o icono.
 */
const NEPTUNE_APPS = [
  { id: 'calendar', label: 'Calendario', icon: 'calendar.svg' },
  { id: 'notes', label: 'Notas', icon: 'notes.svg' },
  { id: 'contacts', label: 'Contactos', icon: 'contacts.svg' },
  { id: 'settings', label: 'Configuración', icon: 'settings.svg' }
];

export function createHomeScreen() {
  const screen = document.createElement('section');
  screen.className = 'neptune-screen neptune-home';
  screen.setAttribute('aria-label', 'Inicio');
  screen.append(createItemList(NEPTUNE_APPS));

  return screen;
}
