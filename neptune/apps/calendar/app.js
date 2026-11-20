/* Aplicación Calendario: sus futuros controles se montarán dentro del panel. */
import { mountAppPanel } from '../../js/components/app-panel.js';

export function mount(container) {
  return mountAppPanel(container, {
    className: 'neptune-calendar-panel',
    titleKey: 'app.calendar'
  });
}
