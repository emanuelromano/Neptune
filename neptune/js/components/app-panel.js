/* Panel base de una app abierta. Cada app conserva además su clase propia. */
import { subscribeLanguage, t } from '../../i18n/index.js';

export function mountAppPanel(container, { className, titleKey }) {
  const panel = document.createElement('section');
  panel.className = `neptune-app-panel ${className}`;
  const updateLabel = () => panel.setAttribute('aria-label', t(titleKey));
  updateLabel();
  const unsubscribeLanguage = subscribeLanguage(updateLabel);
  container.append(panel);

  return () => {
    unsubscribeLanguage();
    panel.remove();
  };
}
