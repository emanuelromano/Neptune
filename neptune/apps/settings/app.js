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

// PALETA DE ACENTO: añade o cambia opciones aquí sin alterar la lógica del selector.
const ACCENT_COLORS = [
  { name: 'Rojo', value: '#ff3b30' },
  { name: 'Naranja', value: '#ff9500' },
  { name: 'Amarillo', value: '#ffcc00' },
  { name: 'Verde', value: '#34c759' },
  { name: 'Azul claro', value: '#5ac8fa' },
  { name: 'Morado', value: '#af52de' }
];

export function mount(container) {
  const panel = document.createElement('section');
  panel.className = 'neptune-settings-panel';
  panel.setAttribute('aria-label', 'Ajustes de apariencia');

  const accentRow = createAccentRow();
  const themeRow = createThemeRow();
  const watchfaceRow = createWatchfaceRow();
  const fontScaleRow = createFontScaleRow();
  panel.append(accentRow.row, themeRow.row, watchfaceRow.row, fontScaleRow.row);
  container.append(panel);

  syncControls(getPreferences(), accentRow.buttons, themeRow.input, watchfaceRow.dropdown, fontScaleRow.dropdown);
  const unsubscribe = subscribePreferences((preferences) => {
    syncControls(preferences, accentRow.buttons, themeRow.input, watchfaceRow.dropdown, fontScaleRow.dropdown);
  });

  return () => {
    unsubscribe();
    watchfaceRow.dropdown.destroy();
    fontScaleRow.dropdown.destroy();
    panel.remove();
  };
}

function createAccentRow() {
  const row = document.createElement('section');
  row.className = 'neptune-settings-accent-row';
  row.setAttribute('aria-label', 'Color de acento');

  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = 'Color de acento';

  const palette = document.createElement('div');
  palette.className = 'neptune-settings-accent-palette';
  palette.setAttribute('role', 'radiogroup');
  palette.setAttribute('aria-label', 'Elegir color de acento');

  const buttons = ACCENT_COLORS.map((accent) => {
    const button = document.createElement('button');
    button.className = 'neptune-settings-accent-option';
    button.type = 'button';
    button.value = accent.value;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-label', accent.name);
    button.setAttribute('aria-checked', 'false');

    const swatch = document.createElement('span');
    swatch.className = 'neptune-settings-accent-swatch';
    swatch.style.backgroundColor = accent.value;
    swatch.setAttribute('aria-hidden', 'true');
    button.append(swatch);

    button.addEventListener('click', () => {
      updatePreferences({ accentColor: accent.value });
    });
    palette.append(button);
    return button;
  });

  row.append(label, palette);
  return { row, buttons };
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
  const row = document.createElement('section');
  row.className = 'neptune-settings-watchface-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = 'Reloj';
  const dropdown = createSettingsDropdown({
    ariaLabel: 'Elegir watchface',
    options: WATCHFACES.map((watchface) => ({ value: watchface.id, label: watchface.name })),
    onChange: (value) => {
      updatePreferences({ selectedWatchface: value });
    }
  });
  row.append(label, dropdown.element);
  return { row, dropdown };
}

function createFontScaleRow() {
  const row = document.createElement('section');
  row.className = 'neptune-settings-watchface-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = 'Tamaño de texto';
  const dropdown = createSettingsDropdown({
    ariaLabel: 'Elegir tamaño de texto',
    options: [
      { value: '0.9', label: 'Pequeño' },
      { value: '1', label: 'Normal' },
      { value: '1.1', label: 'Grande' },
      { value: '1.2', label: 'Muy grande' }
    ],
    onChange: (value) => {
      updatePreferences({ fontScale: Number(value) });
    }
  });
  row.append(label, dropdown.element);
  return { row, dropdown };
}

/*
 * DESPLEGABLE PERSONALIZADO
 * Sustituye al <select> nativo para que el ítem seleccionado use el color de
 * acento en Safari y Chromium, donde el resaltado nativo no es personalizable.
 */
function createSettingsDropdown({ ariaLabel, options, onChange }) {
  const element = document.createElement('div');
  element.className = 'neptune-settings-dropdown';

  const trigger = document.createElement('button');
  trigger.className = 'neptune-settings-watchface-select';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', ariaLabel);
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const triggerText = document.createElement('span');
  triggerText.className = 'neptune-settings-dropdown-value';
  trigger.append(triggerText);

  const menu = document.createElement('div');
  menu.className = 'neptune-settings-dropdown-options';
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', ariaLabel);

  const optionButtons = options.map((option) => {
    const button = document.createElement('button');
    button.className = 'neptune-settings-dropdown-option';
    button.type = 'button';
    button.value = String(option.value);
    button.textContent = option.label;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', 'false');
    button.addEventListener('click', () => {
      onChange(option.value);
      close();
    });
    menu.append(button);
    return button;
  });

  function close() {
    element.classList.remove('neptune-settings-dropdown--open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => {
    const isOpen = element.classList.toggle('neptune-settings-dropdown--open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });

  const closeFromOutside = (event) => {
    if (!element.contains(event.target)) close();
  };
  const closeFromKeyboard = (event) => {
    if (event.key === 'Escape') close();
  };
  document.addEventListener('pointerdown', closeFromOutside);
  document.addEventListener('keydown', closeFromKeyboard);

  element.append(trigger, menu);
  return {
    element,
    setValue(value) {
      const selected = optionButtons.find((button) => button.value === String(value));
      if (!selected) return;
      triggerText.textContent = selected.textContent;
      optionButtons.forEach((button) => {
        const isSelected = button === selected;
        button.classList.toggle('neptune-settings-dropdown-option--selected', isSelected);
        button.setAttribute('aria-selected', String(isSelected));
      });
    },
    destroy() {
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeFromKeyboard);
    }
  };
}

function syncControls(preferences, accentButtons, themeInput, watchfaceDropdown, fontScaleDropdown) {
  accentButtons.forEach((button) => {
    const selected = button.value === preferences.accentColor;
    button.classList.toggle('neptune-settings-accent-option--selected', selected);
    button.setAttribute('aria-checked', String(selected));
  });
  themeInput.checked = preferences.theme === 'dark';
  watchfaceDropdown.setValue(preferences.selectedWatchface);
  fontScaleDropdown.setValue(preferences.fontScale);
}
