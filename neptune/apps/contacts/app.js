/* Aplicación Contactos: sus futuros controles se montarán dentro del panel. */
import { mountAppPanel } from '../../js/components/app-panel.js';

export function mount(container) {
  return mountAppPanel(container, {
    className: 'neptune-contacts-panel',
    titleKey: 'app.contacts'
  });
}
