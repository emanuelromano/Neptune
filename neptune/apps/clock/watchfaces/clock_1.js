/*
 * WATCHFACE 1 — Analógica con números
 * Muestra doce números sans serif y 60 puntos periféricos para los minutos.
 */
import { getPreferences, subscribePreferences } from '../../../core/preferences.js';
import { subscribeLanguage, t } from '../../../i18n/index.js';

const CLOCK_CONFIG = Object.freeze({
  diameter: 360,
  // AGUJAS: mismos tamaños que la watchface Analog 2.
  hourHandLength: 85,
  hourHandThickness: 8,
  minuteHandLength: 140,
  minuteHandThickness: 6,
  secondHandLength: 145,
  secondHandThickness: 2,
  centerDotDiameter: 16,
  // Disco de hora/minuto: 4 px más de radio que el punto central.
  handHubRadiusExtra: 4,
  digitalTimeFontSize: 24,
  digitalTimeWidth: 110,
  digitalTimeTop: 20,
  digitalTimeRight: 20,
  // NÚMEROS: distancia al centro y tamaño de la fuente sans serif.
  numberRadius: 143,
  numberFontSize: 32,
  // MINUTOS: diámetro de los 60 puntos y distancia desde el borde exterior.
  minutePointSize: 3,
  minutePointInset: 7
});

const THEME_COLORS = Object.freeze({
  light: { neutral: '#000000' },
  dark: { neutral: '#ffffff' }
});

export function mount(container) {
  const clock = document.createElement('div');
  clock.className = 'neptune-clock neptune-clock--analog-1';
  clock.setAttribute('role', 'group');
  clock.setAttribute('aria-label', t('clock.analog1Label'));
  applyConfiguration(clock);

  const face = document.createElement('div');
  face.className = 'neptune-clock-face';
  const digitalTime = document.createElement('time');
  digitalTime.className = 'neptune-clock-digital';
  digitalTime.setAttribute('aria-label', t('clock.digitalLabel'));

  // Los 60 puntos se sitúan por fuera del círculo formado por los números.
  for (let minute = 0; minute < 60; minute += 1) {
    const point = document.createElement('span');
    point.className = 'neptune-clock-minute-point';
    point.style.setProperty('--clock-minute-point-angle', `${minute * 6}deg`);
    face.append(point);
  }

  // 12 arriba, 3 a la derecha, 6 abajo y 9 a la izquierda.
  for (let number = 1; number <= 12; number += 1) {
    const label = document.createElement('span');
    label.className = 'neptune-clock-number';
    label.textContent = String(number);
    const angle = (number % 12) * 30;
    label.style.setProperty('--clock-number-angle', `${angle}deg`);
    // Mantiene el número recto sin depender de multiplicación CSS experimental.
    label.style.setProperty('--clock-number-counter-angle', `${-angle}deg`);
    face.append(label);
  }

  const hourHand = createHand('hour');
  const minuteHand = createHand('minute');
  const handHub = document.createElement('span');
  handHub.className = 'neptune-clock-hand-hub';
  const secondHand = createHand('second');
  const centerDot = document.createElement('span');
  centerDot.className = 'neptune-clock-center-dot';
  face.append(hourHand, minuteHand, handHub, secondHand, centerDot);
  clock.append(face, digitalTime);
  container.append(clock);

  function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    hourHand.style.setProperty('--clock-hand-angle', `${hours * 30 + minutes * 0.5}deg`);
    minuteHand.style.setProperty('--clock-hand-angle', `${minutes * 6 + seconds * 0.1}deg`);
    secondHand.style.setProperty('--clock-hand-angle', `${seconds * 6}deg`);
    digitalTime.textContent = `${now.getHours()}:${String(minutes).padStart(2, '0')}`;
  }

  applyTheme(clock, getPreferences());
  updateClock();
  const interval = window.setInterval(updateClock, 1000);
  const unsubscribePreferences = subscribePreferences((next, previous) => {
    if (next.theme !== previous.theme || next.accentColor !== previous.accentColor) {
      applyTheme(clock, next);
    }
  });
  const unsubscribeLanguage = subscribeLanguage(() => {
    clock.setAttribute('aria-label', t('clock.analog1Label'));
    digitalTime.setAttribute('aria-label', t('clock.digitalLabel'));
  });

  return () => {
    window.clearInterval(interval);
    unsubscribePreferences();
    unsubscribeLanguage();
    clock.remove();
  };
}

function createHand(type) {
  const hand = document.createElement('span');
  hand.className = `neptune-clock-hand neptune-clock-hand--${type}`;
  return hand;
}

function applyConfiguration(clock) {
  const values = {
    '--clock-diameter': `${CLOCK_CONFIG.diameter}px`,
    '--clock-hour-hand-length': `${CLOCK_CONFIG.hourHandLength}px`,
    '--clock-hour-hand-thickness': `${CLOCK_CONFIG.hourHandThickness}px`,
    '--clock-minute-hand-length': `${CLOCK_CONFIG.minuteHandLength}px`,
    '--clock-minute-hand-thickness': `${CLOCK_CONFIG.minuteHandThickness}px`,
    '--clock-second-hand-length': `${CLOCK_CONFIG.secondHandLength}px`,
    '--clock-second-hand-thickness': `${CLOCK_CONFIG.secondHandThickness}px`,
    '--clock-center-dot-diameter': `${CLOCK_CONFIG.centerDotDiameter}px`,
    '--clock-hand-hub-diameter': `${CLOCK_CONFIG.centerDotDiameter + CLOCK_CONFIG.handHubRadiusExtra * 2}px`,
    '--clock-digital-font-size': `${CLOCK_CONFIG.digitalTimeFontSize}px`,
    '--clock-digital-width': `${CLOCK_CONFIG.digitalTimeWidth}px`,
    '--clock-digital-top': `${CLOCK_CONFIG.digitalTimeTop}px`,
    '--clock-digital-right': `${CLOCK_CONFIG.digitalTimeRight}px`,
    '--clock-number-offset': `-${CLOCK_CONFIG.numberRadius}px`,
    '--clock-number-font-size': `${CLOCK_CONFIG.numberFontSize}px`,
    '--clock-minute-point-size': `${CLOCK_CONFIG.minutePointSize}px`,
    '--clock-minute-point-inset': `${CLOCK_CONFIG.minutePointInset}px`
  };

  Object.entries(values).forEach(([name, value]) => clock.style.setProperty(name, value));
}

function applyTheme(clock, preferences) {
  const colors = THEME_COLORS[preferences.theme] ?? THEME_COLORS.light;
  const accentColor = preferences.accentColor ?? '#ff3b30';
  // Hora, minutos y hora digital conservan el color de acento del sistema.
  clock.style.setProperty('--clock-hour-hand-color', accentColor);
  clock.style.setProperty('--clock-minute-hand-color', accentColor);
  clock.style.setProperty('--clock-hand-hub-color', accentColor);
  clock.style.setProperty('--clock-digital-color', accentColor);
  // Segundos, punto central, números y puntos de minuto comparten el neutro del tema.
  clock.style.setProperty('--clock-second-hand-color', colors.neutral);
  clock.style.setProperty('--clock-center-dot-color', colors.neutral);
  clock.style.setProperty('--clock-number-color', colors.neutral);
  clock.style.setProperty('--clock-minute-point-color', colors.neutral);
}
