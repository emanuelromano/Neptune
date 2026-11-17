import { createItemList } from '../components/item-list.js';

const PLACEHOLDER_ITEMS = Array.from(
  { length: 4 },
  (_, index) => `Item ${index + 1}`
);

export function createHomeScreen() {
  const screen = document.createElement('section');
  screen.className = 'neptune-screen neptune-home';
  screen.setAttribute('aria-label', 'Inicio');
  screen.append(createItemList(PLACEHOLDER_ITEMS));

  return screen;
}
