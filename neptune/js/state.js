import { getPreferences } from '../core/preferences.js';

/**
 * Estado central de la UI. Se irá ampliando al incorporar navegación,
 * preferencias y datos de las aplicaciones de Neptune.
 */
export function createNeptuneState() {
  const preferences = getPreferences();
  return {
    screen: 'home',
    // Snapshot inicial; las apps se actualizan después por suscripción.
    preferences
  };
}
