/*
 * CONFIGURACIÓN DEL RELOJ ANALÓGICO
 * Todas las medidas están en píxeles. Ajusta estos valores para cambiar el
 * aspecto del reloj sin modificar la lógica que calcula la hora.
 */
const CLOCK_CONFIG = Object.freeze({
  // Diámetro total del reloj; se mantiene centrado dentro del cuadrado padre.
  diameter: 360,

  // Marcas horarias: largo, grosor y color de las 12 líneas del perímetro.
  tickLength: 14,
  tickThickness: 5,
  tickColor: '#3f3f3f',
  // Separación entre el borde del reloj y el inicio de cada marca horaria.
  tickInset: 8,

  // Aguja de horas: largo, grosor y color.
  hourHandLength: 85,
  hourHandThickness: 8,
  hourHandColor: '#000000',

  // Aguja de minutos: largo, grosor y color.
  minuteHandLength: 140,
  minuteHandThickness: 6,
  minuteHandColor: '#000000',

  // Aguja de segundos: largo, grosor y color.
  secondHandLength: 145,
  secondHandThickness: 2,
  secondHandColor: '#d62525',

  // Círculo central: diámetro y color.
  centerDotDiameter: 16,
  centerDotColor: '#d62525',

  // Hora digital (24 h): tamaño, color y ancho con alineación a la derecha.
  digitalTimeFontSize: 24,
  digitalTimeColor: '#000000',
  digitalTimeWidth: 110,
  // Márgenes respecto de la esquina superior derecha del cuadrado contenedor.
  digitalTimeTop: 18,
  digitalTimeRight: 18
});

/** Crea un reloj analógico que se actualiza una vez por segundo. */
export function createClock() {
  const clock = document.createElement('div');
  clock.className = 'neptune-clock';
  clock.setAttribute('role', 'group');
  clock.setAttribute('aria-label', 'Reloj analógico');
  applyClockConfiguration(clock);

  const face = document.createElement('div');
  face.className = 'neptune-clock-face';

  const digitalTime = document.createElement('time');
  digitalTime.className = 'neptune-clock-digital';
  digitalTime.setAttribute('aria-label', 'Hora digital');

  // Se crean 12 marcas, una por cada hora del reloj.
  for (let hour = 0; hour < 12; hour += 1) {
    const tick = document.createElement('span');
    tick.className = 'neptune-clock-tick';
    tick.style.setProperty('--clock-tick-angle', `${hour * 30}deg`);
    tick.setAttribute('aria-hidden', 'true');
    face.append(tick);
  }

  const hourHand = createHand('hour');
  const minuteHand = createHand('minute');
  const secondHand = createHand('second');
  const centerDot = document.createElement('span');
  centerDot.className = 'neptune-clock-center-dot';
  centerDot.setAttribute('aria-hidden', 'true');

  face.append(hourHand, minuteHand, secondHand, centerDot);
  clock.append(face, digitalTime);

  function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    hourHand.style.setProperty('--clock-hand-angle', `${hours * 30 + minutes * 0.5}deg`);
    minuteHand.style.setProperty('--clock-hand-angle', `${minutes * 6 + seconds * 0.1}deg`);
    secondHand.style.setProperty('--clock-hand-angle', `${seconds * 6}deg`);
    digitalTime.textContent = `${now.getHours()}:${String(minutes).padStart(2, '0')}`;
    digitalTime.dateTime = `${String(now.getHours()).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  return clock;
}

function createHand(type) {
  const hand = document.createElement('span');
  hand.className = `neptune-clock-hand neptune-clock-hand--${type}`;
  hand.setAttribute('aria-hidden', 'true');

  return hand;
}

function applyClockConfiguration(clock) {
  const values = {
    '--clock-diameter': `${CLOCK_CONFIG.diameter}px`,
    '--clock-tick-length': `${CLOCK_CONFIG.tickLength}px`,
    '--clock-tick-thickness': `${CLOCK_CONFIG.tickThickness}px`,
    '--clock-tick-color': CLOCK_CONFIG.tickColor,
    '--clock-tick-inset': `${CLOCK_CONFIG.tickInset}px`,
    '--clock-hour-hand-length': `${CLOCK_CONFIG.hourHandLength}px`,
    '--clock-hour-hand-thickness': `${CLOCK_CONFIG.hourHandThickness}px`,
    '--clock-hour-hand-color': CLOCK_CONFIG.hourHandColor,
    '--clock-minute-hand-length': `${CLOCK_CONFIG.minuteHandLength}px`,
    '--clock-minute-hand-thickness': `${CLOCK_CONFIG.minuteHandThickness}px`,
    '--clock-minute-hand-color': CLOCK_CONFIG.minuteHandColor,
    '--clock-second-hand-length': `${CLOCK_CONFIG.secondHandLength}px`,
    '--clock-second-hand-thickness': `${CLOCK_CONFIG.secondHandThickness}px`,
    '--clock-second-hand-color': CLOCK_CONFIG.secondHandColor,
    '--clock-center-dot-diameter': `${CLOCK_CONFIG.centerDotDiameter}px`,
    '--clock-center-dot-color': CLOCK_CONFIG.centerDotColor,
    '--clock-digital-font-size': `${CLOCK_CONFIG.digitalTimeFontSize}px`,
    '--clock-digital-color': CLOCK_CONFIG.digitalTimeColor,
    '--clock-digital-width': `${CLOCK_CONFIG.digitalTimeWidth}px`,
    '--clock-digital-top': `${CLOCK_CONFIG.digitalTimeTop}px`,
    '--clock-digital-right': `${CLOCK_CONFIG.digitalTimeRight}px`
  };

  Object.entries(values).forEach(([name, value]) => {
    clock.style.setProperty(name, value);
  });
}
