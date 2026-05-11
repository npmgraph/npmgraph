import confetti from 'canvas-confetti';
import { $ } from 'select-dom';
import * as graphDiagramStyles from '../components/GraphDiagram/GraphDiagram.module.scss';
import * as appHeaderStyles from '../components/AppHeader.module.scss';
import * as styles from './flash.module.scss';

const FLASH_GAP = 10;

export function flash(wat: unknown, bg = '#f80') {
  const graph = document.querySelector<HTMLElement>(
    `.${graphDiagramStyles.graph}`,
  );
  if (!(graph instanceof HTMLElement)) {
    throw new TypeError('Graph element not found or invalid');
  }
  const flashes = document.querySelectorAll<HTMLElement>(`.${styles.flash}`);
  const previous = flashes.length > 0 ? flashes.item(flashes.length - 1) : null;
  const element = document.createElement('div');

  if (wat instanceof Error) {
    element.classList.add('error');
    element.textContent = wat.message;
  } else if (wat instanceof Document) {
    const body = $('body', wat);
    if (body) {
      element.append(...body.children);
    }
  } else if (wat instanceof Element || wat instanceof DocumentFragment) {
    element.append(wat);
  } else if (typeof wat === 'string') {
    element.textContent = wat;
  } else {
    element.textContent = JSON.stringify(wat, null, 2);
  }

  document.body.append(element);
  element.classList.add(styles.flash);

  let top = previous ? previous.offsetTop + previous.offsetHeight : 0;
  if (top <= 0 || top >= window.innerHeight - element.offsetHeight) {
    top = defaultTop();
  }

  element.style.top = `${top + FLASH_GAP / 2}px`;
  element.style.left = `${-element.offsetWidth - FLASH_GAP}px`;
  element.style.maxWidth = `${graph.offsetWidth - FLASH_GAP}px`;
  element.style.backgroundColor = bg;

  setTimeout(() => {
    element.style.left = `${FLASH_GAP}px`;

    setTimeout(() => {
      element.addEventListener('transitionend', () => element.remove());
      element.style.left = `${-element.offsetWidth - FLASH_GAP}px`;
    }, 5000);
  }, 0);
  return element;
}

export function celebrate(message: string) {
  const element = flash(`🎉 ${message} 🎉`, 'transparent');

  const y =
    (element.clientTop + element.clientHeight / 2) / document.body.clientHeight;

  confetti({
    particleCount: 100,
    ticks: 100,
    spread: 90,
    angle: -20,
    origin: { x: 0, y },
  });
}

function defaultTop() {
  const appHeader = document.querySelectorAll<HTMLElement>(
    `.${appHeaderStyles.root}`,
  );
  if (appHeader.length === 0) return 0;

  const appHeaderElement = appHeader[0];
  if (!(appHeaderElement instanceof HTMLElement)) return 0;

  return appHeaderElement.offsetTop + appHeaderElement.offsetHeight;
}
