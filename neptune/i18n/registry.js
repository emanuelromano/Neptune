/*
 * REGISTRO DE IDIOMAS DISPONIBLES
 * En una aplicación estática el navegador no puede enumerar carpetas. Para
 * incorporar un idioma, importa su archivo aquí y añade una entrada: la app
 * Configuración lo detectará automáticamente a partir de este registro.
 */
import en from './en.js';
import es from './es.js';

export const DEFAULT_LANGUAGE = 'en';

export const AVAILABLE_LANGUAGES = Object.freeze([
  { id: 'en', nameKey: 'language.en', messages: en },
  { id: 'es', nameKey: 'language.es', messages: es }
]);

export function getLanguageDefinition(language) {
  return AVAILABLE_LANGUAGES.find((locale) => locale.id === language)
    ?? AVAILABLE_LANGUAGES.find((locale) => locale.id === DEFAULT_LANGUAGE);
}
