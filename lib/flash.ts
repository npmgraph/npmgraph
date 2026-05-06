import confetti from 'canvas-confetti';
import { $ } from 'select-dom';
import * as appHeaderStyles from '../components/AppHeader.module.scss';
import * as styles from './flash.module.scss';

const FLASH_GAP = 10;

export function flash(wat: unknown, bg = '#f80') {
  const graph = $('#graph');
  const flashes = document.getElementsByClassName(styles.flash);
  const prev =
    flashes.length > 0 ? (flashes[flashes.length - 1] as HTMLElement) : null;
  const el = document.createElement('div');

  if (wat instanceof Error) {
    el.classList.add('error');
    el.textContent = wat.message;
  } else if (wat instanceof Document) {
    const body = $('body', wat);
    if (body) {
      el.append(...body.children);
    }
  } else if (wat instanceof Element || wat instanceof DocumentFragment) {
    el.append(wat);
  } else if (typeof wat == 'string') {
    el.textContent = wat;
  } else {
    el.textContent = JSON.stringify(wat, null, 2);
  }

  document.body.appendChild(el);
  el.classList.add(styles.flash);

  let top = prev ? prev.offsetTop + prev.offsetHeight : 0;
  if (top <= 0 || top >= window.innerHeight - el.offsetHeight) {
    top = defaultTop();
  }

  el.style.top = `${top + FLASH_GAP / 2}px`;
  el.style.left = `${-el.offsetWidth - FLASH_GAP}px`;
  el.style.maxWidth = graph ? `${graph.offsetWidth - FLASH_GAP}px` : '100%';
  el.style.backgroundColor = bg;

  setTimeout(() => {
    el.style.left = `${FLASH_GAP}px`;

    setTimeout(() => {
      el.addEventListener('transitionend', () => el.remove());
      el.style.left = `${-el.offsetWidth - FLASH_GAP}px`;
    }, 5000);
  }, 0);
  return el;
}

export function celebrate(msg: string) {
  const el = flash(`🎉 ${msg} 🎉`, 'transparent');

  const y = (el.clientTop + el.clientHeight / 2) / document.body.clientHeight;

  confetti({
    particleCount: 100,
    ticks: 100,
    spread: 90,
    angle: -20,
    origin: { x: 0, y },
  });
}

function defaultTop() {
  const appHeader = document.querySelector<HTMLElement>(
    `.${appHeaderStyles.root}`,
  );
  return appHeader ? appHeader.offsetTop + appHeader.offsetHeight : 0;
}
