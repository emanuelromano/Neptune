import { subscribeLanguage, t } from '../neptune/i18n/index.js';

(() => {
  'use strict';

  const RESOLUTIONS = {
    'pda-5-portrait': { width: 480, height: 800, labelKey: 'simulator.resolution.pda5Portrait' },
    'pda-5-landscape': { width: 800, height: 480, labelKey: 'simulator.resolution.pda5Landscape' },
    'pda-7-portrait': { width: 600, height: 1024, labelKey: 'simulator.resolution.pda7Portrait' },
    'pda-7-landscape': { width: 1024, height: 600, labelKey: 'simulator.resolution.pda7Landscape' }
  };

  const workspace = document.getElementById('workspace');
  const canvasShell = document.getElementById('canvas-shell');
  const canvas = document.getElementById('pda-canvas');
  const fullscreenButton = document.getElementById('fullscreen-button');
  const statusMessage = document.getElementById('status-message');
  const resolutionSelect = document.getElementById('resolution-select');

  let selectedResolution = RESOLUTIONS['pda-5-portrait'];
  let statusKey = '';

  function setStatus(messageKey = '') {
    statusKey = messageKey;
    statusMessage.textContent = messageKey ? t(messageKey) : '';
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
      setStatus('simulator.fullscreen.unavailable');
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      setStatus();
    } catch (error) {
      setStatus('simulator.fullscreen.failed');
    }
  }

  async function exitFullscreen() {
    if (!document.fullscreenElement) return;
    if (!document.exitFullscreen) {
      setStatus('simulator.fullscreen.exitUnavailable');
      return;
    }

    try {
      await document.exitFullscreen();
    } catch (error) {
      setStatus('simulator.fullscreen.exitFailed');
    }
  }

  function updateFullscreenButton() {
    fullscreenButton.textContent = t(isFullscreen()
      ? 'simulator.fullscreen.active'
      : 'simulator.fullscreen.enter');
  }

  function updateSimulatorCopy() {
    document.title = t('simulator.title');
    document.getElementById('controls').setAttribute('aria-label', t('simulator.controls'));
    document.querySelector('.resolution-picker label').textContent = t('simulator.resolutionOrientation');
    Object.entries(RESOLUTIONS).forEach(([id, resolution]) => {
      const option = resolutionSelect.querySelector(`option[value="${id}"]`);
      if (option) option.textContent = t(resolution.labelKey);
    });
    workspace.setAttribute('aria-label', t('simulator.preview'));
    canvas.setAttribute('aria-label', t('simulator.neptuneScreen'));
    updateFullscreenButton();
    if (statusKey) statusMessage.textContent = t(statusKey);
  }

  window.exitFullscreen = exitFullscreen;
  resolutionSelect.addEventListener('change', () => setResolution(resolutionSelect.value));
  fullscreenButton.addEventListener('click', enterFullscreen);
  window.addEventListener('resize', updateCanvasScale);
  document.addEventListener('fullscreenchange', () => {
    updateFullscreenButton();
    updateCanvasScale();
  });

  subscribeLanguage(updateSimulatorCopy);
  updateSimulatorCopy();
  setResolution('pda-5-portrait');
})();
