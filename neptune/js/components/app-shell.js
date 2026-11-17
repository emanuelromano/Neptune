/**
 * Contenedor raíz de la aplicación. Los componentes visuales de Neptune se
 * renderizarán aquí, sin depender del simulador que rodea al canvas.
 */
export function createAppShell(state) {
  const appShell = document.createElement('div');
  appShell.className = 'neptune-shell';
  appShell.dataset.screen = state.screen;

  return appShell;
}
