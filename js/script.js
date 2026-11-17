(() => {
  'use strict';

  const RESOLUTIONS = {
    'pda-5-portrait': { width: 480, height: 800 },
    'pda-5-landscape': { width: 800, height: 480 },
    'pda-7-portrait': { width: 600, height: 1024 },
    'pda-7-landscape': { width: 1024, height: 600 }
  };

  const workspace = document.getElementById('workspace');
  const canvasShell = document.getElementById('canvas-shell');
  const canvas = document.getElementById('pda-canvas');
  const fullscreenButton = document.getElementById('fullscreen-button');
  const statusMessage = document.getElementById('status-message');
  const resolutionInputs = document.querySelectorAll('input[name="resolution"]');

  let selectedResolution = RESOLUTIONS['pda-5-portrait'];

  function setStatus(message = '') {
    statusMessage.textContent = message;
  }

  function isFullscreen() {
    return document.fullscreenElement === document.documentElement;
  }

  function updateCanvasScale() {
    const availableWidth = workspace.clientWidth;
    const availableHeight = workspace.clientHeight;
    const scaleToFit = Math.min(
      availableWidth / selectedResolution.width,
      availableHeight / selectedResolution.height
    );

    // En pantalla completa se permite ampliar; fuera de ella, solo se reduce.
    const scale = isFullscreen() ? scaleToFit : Math.min(1, scaleToFit);
    canvasShell.style.transform = `scale(${Math.max(0, scale)})`;
  }

  function setResolution(resolutionKey) {
    const resolution = RESOLUTIONS[resolutionKey];
    if (!resolution) return;

    selectedResolution = resolution;
    canvas.style.width = `${resolution.width}px`;
    canvas.style.height = `${resolution.height}px`;
    canvasShell.style.width = `${resolution.width}px`;
    canvasShell.style.height = `${resolution.height}px`;
    updateCanvasScale();
  }

  async function enterFullscreen() {
    if (!document.documentElement.requestFullscreen) {
      setStatus('La pantalla completa no está disponible en este navegador.');
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      setStatus();
    } catch (error) {
      setStatus('No fue posible activar la pantalla completa.');
    }
  }

  async function exitFullscreen() {
    if (!document.fullscreenElement) return;
    if (!document.exitFullscreen) {
      setStatus('No se puede salir de pantalla completa desde este navegador.');
      return;
    }

    try {
      await document.exitFullscreen();
    } catch (error) {
      setStatus('No fue posible salir de la pantalla completa.');
    }
  }

  window.exitFullscreen = exitFullscreen;

  resolutionInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) setResolution(input.value);
    });
  });

  fullscreenButton.addEventListener('click', enterFullscreen);
  window.addEventListener('resize', updateCanvasScale);
  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.textContent = isFullscreen()
      ? 'Pantalla completa activa'
      : 'Ver en pantalla completa';
    updateCanvasScale();
  });

  setResolution('pda-5-portrait');
})();
