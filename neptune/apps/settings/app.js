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
import { t } from '../../i18n/index.js';
import { AVAILABLE_LANGUAGES } from '../../i18n/registry.js';
import { WATCHFACES } from '../clock/watchfaces/registry.js';

// PALETA DE ACENTO: añade o cambia opciones aquí sin alterar la lógica del selector.
const ACCENT_COLORS = [
  { nameKey: 'color.red', value: '#ff3b30' },
  { nameKey: 'color.orange', value: '#ff9500' },
  { nameKey: 'color.yellow', value: '#ffcc00' },
  { nameKey: 'color.green', value: '#34c759' },
  { nameKey: 'color.lightBlue', value: '#5ac8fa' },
  { nameKey: 'color.purple', value: '#af52de' }
];

export function mount(container) {
  const panel = document.createElement('section');
  panel.className = 'neptune-settings-panel';
  panel.setAttribute('aria-label', t('settings.panelLabel'));

  const accentRow = createAccentRow();
  const themeRow = createThemeRow();
  const watchfaceRow = createWatchfaceRow();
  const fontScaleRow = createFontScaleRow();
  const languageRow = createLanguageRow();
  const rows = [accentRow, themeRow, watchfaceRow, fontScaleRow, languageRow];
  panel.append(...rows.map(({ row }) => row));
  container.append(panel);

  updateSettingsCopy(panel, rows);
  syncControls(getPreferences(), accentRow.buttons, themeRow.input, watchfaceRow.dropdown, fontScaleRow.dropdown, languageRow.dropdown);
  const unsubscribe = subscribePreferences((preferences) => {
    updateSettingsCopy(panel, rows);
    syncControls(preferences, accentRow.buttons, themeRow.input, watchfaceRow.dropdown, fontScaleRow.dropdown, languageRow.dropdown);
  });

  return () => {
    unsubscribe();
    watchfaceRow.dropdown.destroy();
    fontScaleRow.dropdown.destroy();
    languageRow.dropdown.destroy();
    panel.remove();
  };
}

function createAccentRow() {
  const row = document.createElement('section');
  row.className = 'neptune-settings-accent-row';
  row.setAttribute('aria-label', t('settings.accentColor'));

  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = t('settings.accentColor');

  const palette = document.createElement('div');
  palette.className = 'neptune-settings-accent-palette';
  palette.setAttribute('role', 'radiogroup');
  palette.setAttribute('aria-label', t('settings.selectAccentColor'));

  const buttons = ACCENT_COLORS.map((accent) => {
    const button = document.createElement('button');
    button.className = 'neptune-settings-accent-option';
    button.type = 'button';
    button.value = accent.value;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-label', t(accent.nameKey));
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
  return {
    row,
    buttons,
    updateLanguage() {
      row.setAttribute('aria-label', t('settings.accentColor'));
      label.textContent = t('settings.accentColor');
      palette.setAttribute('aria-label', t('settings.selectAccentColor'));
      buttons.forEach((button, index) => button.setAttribute('aria-label', t(ACCENT_COLORS[index].nameKey)));
    }
  };
}

function createThemeRow() {
  const row = document.createElement('label');
  row.className = 'neptune-settings-theme-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = t('settings.darkMode');
  const input = document.createElement('input');
  input.className = 'neptune-settings-theme-input';
  input.type = 'checkbox';
  input.setAttribute('aria-label', t('settings.activateDarkMode'));
  const track = document.createElement('span');
  track.className = 'neptune-settings-theme-switch';
  track.setAttribute('aria-hidden', 'true');
  input.addEventListener('change', () => {
    updatePreferences({ theme: input.checked ? 'dark' : 'light' });
  });
  row.append(label, input, track);
  return {
    row,
    input,
    updateLanguage() {
      label.textContent = t('settings.darkMode');
      input.setAttribute('aria-label', t('settings.activateDarkMode'));
    }
  };
}

function createWatchfaceRow() {
  const row = document.createElement('section');
  row.className = 'neptune-settings-watchface-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = t('settings.clock');
  const dropdown = createSettingsDropdown({
    ariaLabelKey: 'settings.selectWatchface',
    options: WATCHFACES.map((watchface) => ({ value: watchface.id, labelKey: watchface.nameKey })),
    onChange: (value) => {
      updatePreferences({ selectedWatchface: value });
    }
  });
  row.append(label, dropdown.element);
  return {
    row,
    dropdown,
    updateLanguage() {
      label.textContent = t('settings.clock');
      dropdown.updateLanguage();
    }
  };
}

function createFontScaleRow() {
  const row = document.createElement('section');
  row.className = 'neptune-settings-watchface-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = t('settings.textSize');
  const dropdown = createSettingsDropdown({
    ariaLabelKey: 'settings.selectTextSize',
    options: [
      { value: '0.9', labelKey: 'textSize.small' },
      { value: '1', labelKey: 'textSize.normal' },
      { value: '1.1', labelKey: 'textSize.large' },
      { value: '1.2', labelKey: 'textSize.extraLarge' }
    ],
    onChange: (value) => {
      updatePreferences({ fontScale: Number(value) });
    }
  });
  row.append(label, dropdown.element);
  return {
    row,
    dropdown,
    updateLanguage() {
      label.textContent = t('settings.textSize');
      dropdown.updateLanguage();
    }
  };
}

function createLanguageRow() {
  const row = document.createElement('section');
  row.className = 'neptune-settings-watchface-row';
  const label = document.createElement('span');
  label.className = 'neptune-settings-theme-label';
  label.textContent = t('settings.language');
  const dropdown = createSettingsDropdown({
    ariaLabelKey: 'settings.selectLanguage',
    // AVAILABLE_LANGUAGES es el registro que detecta Configuración y alimenta esta lista.
    options: AVAILABLE_LANGUAGES.map((language) => ({ value: language.id, labelKey: language.nameKey })),
    onChange: (value) => {
      updatePreferences({ language: value });
    }
  });
  row.append(label, dropdown.element);
  return {
    row,
    dropdown,
    updateLanguage() {
      label.textContent = t('settings.language');
      dropdown.updateLanguage();
    }
  };
}

/*
 * DESPLEGABLE PERSONALIZADO
 * Sustituye al <select> nativo para que el ítem seleccionado use el color de
 * acento en Safari y Chromium, donde el resaltado nativo no es personalizable.
 */
function createSettingsDropdown({ ariaLabelKey, options, onChange }) {
  const element = document.createElement('div');
  element.className = 'neptune-settings-dropdown';

  const trigger = document.createElement('button');
  trigger.className = 'neptune-settings-watchface-select';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', t(ariaLabelKey));
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const triggerText = document.createElement('span');
  triggerText.className = 'neptune-settings-dropdown-value';
  trigger.append(triggerText);

  const menu = document.createElement('div');
  menu.className = 'neptune-settings-dropdown-options';
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', t(ariaLabelKey));

  const optionButtons = options.map((option) => {
    const button = document.createElement('button');
    button.className = 'neptune-settings-dropdown-option';
    button.type = 'button';
    button.value = String(option.value);
    button.textContent = t(option.labelKey);
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
    updateLanguage() {
      trigger.setAttribute('aria-label', t(ariaLabelKey));
      menu.setAttribute('aria-label', t(ariaLabelKey));
      optionButtons.forEach((button, index) => {
        button.textContent = t(options[index].labelKey);
      });
      const selected = optionButtons.find((button) => button.classList.contains('neptune-settings-dropdown-option--selected'));
      if (selected) triggerText.textContent = selected.textContent;
    },
    destroy() {
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeFromKeyboard);
    }
  };
}

function updateSettingsCopy(panel, rows) {
  panel.setAttribute('aria-label', t('settings.panelLabel'));
  rows.forEach((row) => row.updateLanguage());
}

function syncControls(preferences, accentButtons, themeInput, watchfaceDropdown, fontScaleDropdown, languageDropdown) {
  accentButtons.forEach((button) => {
    const selected = button.value === preferences.accentColor;
    button.classList.toggle('neptune-settings-accent-option--selected', selected);
    button.setAttribute('aria-checked', String(selected));
  });
  themeInput.checked = preferences.theme === 'dark';
  watchfaceDropdown.setValue(preferences.selectedWatchface);
  fontScaleDropdown.setValue(preferences.fontScale);
  languageDropdown.setValue(preferences.language);
}
