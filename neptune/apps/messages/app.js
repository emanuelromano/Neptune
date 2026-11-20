/* Aplicación Mensajes: sus futuros controles se montarán dentro del panel. */
import { mountAppPanel } from '../../js/components/app-panel.js';

export function mount(container) {
  return mountAppPanel(container, {
    className: 'neptune-messages-panel',
    titleKey: 'app.messages'
  });
}
