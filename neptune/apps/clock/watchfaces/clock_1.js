/*
 * WATCHFACE 1 — Analógica clásica
 * Las dimensiones se ajustan aquí; los colores reaccionan a preferencias.theme.
 */
import { getPreferences, subscribePreferences } from '../../../core/preferences.js';

const CLOCK_CONFIG = Object.freeze({
  diameter: 360,
  tickLength: 14,
  tickThickness: 5,
  tickInset: 8,
  hourHandLength: 85,
  hourHandThickness: 8,
  minuteHandLength: 140,
  minuteHandThickness: 6,
  secondHandLength: 145,
  secondHandThickness: 2,
  centerDotDiameter: 16,
  centerDotColor: '#d62525',
  digitalTimeFontSize: 24,
  digitalTimeWidth: 110,
  digitalTimeTop: 20,
  digitalTimeRight: 20
});

const THEME_COLORS = Object.freeze({
  light: {
    tick: '#3f3f3f',
    hour: '#000000',
    minute: '#000000',
    second: '#d62525',
    digital: '#000000'
  },
  dark: {
    tick: '#c9c9c9',
    hour: '#ffffff',
    minute: '#ffffff',
    second: '#d62525',
    digital: '#ffffff'
  }
});

export function mount(container) {
  const clock = document.createElement('div');
  clock.className = 'neptune-clock';
  clock.setAttribute('role', 'group');
  clock.setAttribute('aria-label', 'Reloj analógico');
  applyConfiguration(clock);

  const face = document.createElement('div');
  face.className = 'neptune-clock-face';
  const digitalTime = document.createElement('time');
  digitalTime.className = 'neptune-clock-digital';
  digitalTime.setAttribute('aria-label', 'Hora digital');

  for (let hour = 0; hour < 12; hour += 1) {
    const tick = document.createElement('span');
    tick.className = 'neptune-clock-tick';
    tick.style.setProperty('--clock-tick-angle', `${hour * 30}deg`);
    face.append(tick);
  }

  const hourHand = createHand('hour');
  const minuteHand = createHand('minute');
  const secondHand = createHand('second');
  const centerDot = document.createElement('span');
  centerDot.className = 'neptune-clock-center-dot';
  face.append(hourHand, minuteHand, secondHand, centerDot);
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

  applyTheme(clock, getPreferences().theme);
  updateClock();
  const interval = window.setInterval(updateClock, 1000);
  const unsubscribe = subscribePreferences((next, previous) => {
    if (next.theme !== previous.theme) applyTheme(clock, next.theme);
  });

  return () => {
    window.clearInterval(interval);
    unsubscribe();
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
    '--clock-tick-length': `${CLOCK_CONFIG.tickLength}px`,
    '--clock-tick-thickness': `${CLOCK_CONFIG.tickThickness}px`,
    '--clock-tick-inset': `${CLOCK_CONFIG.tickInset}px`,
    '--clock-hour-hand-length': `${CLOCK_CONFIG.hourHandLength}px`,
    '--clock-hour-hand-thickness': `${CLOCK_CONFIG.hourHandThickness}px`,
    '--clock-minute-hand-length': `${CLOCK_CONFIG.minuteHandLength}px`,
    '--clock-minute-hand-thickness': `${CLOCK_CONFIG.minuteHandThickness}px`,
    '--clock-second-hand-length': `${CLOCK_CONFIG.secondHandLength}px`,
    '--clock-second-hand-thickness': `${CLOCK_CONFIG.secondHandThickness}px`,
    '--clock-center-dot-diameter': `${CLOCK_CONFIG.centerDotDiameter}px`,
    '--clock-center-dot-color': CLOCK_CONFIG.centerDotColor,
    '--clock-digital-font-size': `${CLOCK_CONFIG.digitalTimeFontSize}px`,
    '--clock-digital-width': `${CLOCK_CONFIG.digitalTimeWidth}px`,
    '--clock-digital-top': `${CLOCK_CONFIG.digitalTimeTop}px`,
    '--clock-digital-right': `${CLOCK_CONFIG.digitalTimeRight}px`
  };

  Object.entries(values).forEach(([name, value]) => clock.style.setProperty(name, value));
}

function applyTheme(clock, theme) {
  const colors = THEME_COLORS[theme] ?? THEME_COLORS.light;
  clock.style.setProperty('--clock-tick-color', colors.tick);
  clock.style.setProperty('--clock-hour-hand-color', colors.hour);
  clock.style.setProperty('--clock-minute-hand-color', colors.minute);
  clock.style.setProperty('--clock-second-hand-color', colors.second);
  clock.style.setProperty('--clock-digital-color', colors.digital);
}
