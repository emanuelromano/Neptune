/*
 * APLICACIÓN CONFIGURACIÓN
 * Administra preferencias compartidas. Cualquier cambio se propaga a las
 * demás apps mediante core/preferences.js y queda guardado en localStorage.
 */
import {
  getPreferences,
  subscribePreferences,
  updatePreferences
} from '../../core/preferences.js';
import { WATCHFACES } from '../clock/watchfaces/registry.js';

export function mount(container) {
  const panel = document.createElement('section');
  panel.className = 'neptune-settings-panel';
  panel.setAttribute('aria-label', 'Ajustes de apariencia');

  const themeRow = createThemeRow();
  const watchfaceRow = createWatchfaceRow();
  const fontScaleRow = createFontScaleRow();
  panel.append(themeRow.row, watchfaceRow.row, fontScaleRow.row);
  container.append(panel);

  syncControls(getPreferences(), themeRow.input, watchfaceRow.select, fontScaleRow.select);
  const unsubscribe = subscribePreferences((preferences) => {
    syncControls(preferences, themeRow.input, watchfaceRow.select, fontScaleRow.select);
  });

  return () => {
    unsubscribe();
    panel.remove();
  };
}

function createThemeRow() {
  const row = document.createElement('label');
  row.className = 'neptune-settings-theme-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = 'Modo oscuro';
  const input = document.createElement('input');
  input.className = 'neptune-settings-theme-input';
  input.type = 'checkbox';
  input.setAttribute('aria-label', 'Activar modo oscuro');
  const track = document.createElement('span');
  track.className = 'neptune-settings-theme-switch';
  track.setAttribute('aria-hidden', 'true');
  input.addEventListener('change', () => {
    updatePreferences({ theme: input.checked ? 'dark' : 'light' });
  });
  row.append(label, input, track);
  return { row, input };
}

function createWatchfaceRow() {
  const row = document.createElement('label');
  row.className = 'neptune-settings-watchface-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = 'Reloj';
  const select = document.createElement('select');
  select.className = 'neptune-settings-watchface-select';
  select.setAttribute('aria-label', 'Elegir watchface');

  WATCHFACES.forEach((watchface) => {
    const option = document.createElement('option');
    option.value = watchface.id;
    option.textContent = watchface.name;
    select.append(option);
  });

  select.addEventListener('change', () => {
    updatePreferences({ selectedWatchface: select.value });
  });
  row.append(label, select);
  return { row, select };
}

function createFontScaleRow() {
  const row = document.createElement('label');
  row.className = 'neptune-settings-watchface-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = 'Tamaño de texto';
  const select = document.createElement('select');
  select.className = 'neptune-settings-watchface-select';
  select.setAttribute('aria-label', 'Elegir tamaño de texto');

  [
    { value: '0.9', label: 'Pequeño' },
    { value: '1', label: 'Normal' },
    { value: '1.1', label: 'Grande' },
    { value: '1.2', label: 'Muy grande' }
  ].forEach((size) => {
    const option = document.createElement('option');
    option.value = size.value;
    option.textContent = size.label;
    select.append(option);
  });

  select.addEventListener('change', () => {
    updatePreferences({ fontScale: Number(select.value) });
  });
  row.append(label, select);
  return { row, select };
}

function syncControls(preferences, themeInput, watchfaceSelect, fontScaleSelect) {
  themeInput.checked = preferences.theme === 'dark';
  watchfaceSelect.value = preferences.selectedWatchface;
  fontScaleSelect.value = String(preferences.fontScale);
}
