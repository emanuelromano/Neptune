/*
 * API DE INTERNACIONALIZACIÓN
 * t() traduce una clave y subscribeLanguage() permite que componentes ya
 * montados actualicen su texto cuando cambia la preferencia de idioma.
 */
import { getPreferences, subscribePreferences } from '../core/preferences.js';
import { DEFAULT_LANGUAGE, getLanguageDefinition } from './registry.js';

export function t(key, replacements = {}) {
  const language = getPreferences().language ?? DEFAULT_LANGUAGE;
  const selected = getLanguageDefinition(language).messages;
  const fallback = getLanguageDefinition(DEFAULT_LANGUAGE).messages;
  const template = selected[key] ?? fallback[key] ?? key;

  return template.replace(/\{(\w+)\}/g, (match, name) => String(replacements[name] ?? match));
}

export function subscribeLanguage(listener) {
  return subscribePreferences((nextPreferences, previousPreferences) => {
    if (nextPreferences.language !== previousPreferences.language) {
      listener(nextPreferences.language);
    }
  });
}

export function mountI18nController() {
  applyDocumentLanguage(getPreferences().language);
  return subscribeLanguage(applyDocumentLanguage);
}

function applyDocumentLanguage(language) {
  document.documentElement.lang = getLanguageDefinition(language).id;
}
