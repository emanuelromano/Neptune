import { getPersistedTheme } from './theme.js';

/**
 * Estado central de la UI. Se irá ampliando al incorporar navegación,
 * preferencias y datos de las aplicaciones de Neptune.
 */
export function createNeptuneState() {
  return {
    screen: 'home',
    // Tema inicial recuperado desde localStorage, o claro como valor seguro.
    theme: getPersistedTheme()
  };
}
