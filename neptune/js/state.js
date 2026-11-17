const INITIAL_STATE = Object.freeze({
  screen: 'home'
});

/**
 * Estado central de la UI. Se irá ampliando al incorporar navegación,
 * preferencias y datos de las aplicaciones de Neptune.
 */
export function createNeptuneState() {
  return { ...INITIAL_STATE };
}
