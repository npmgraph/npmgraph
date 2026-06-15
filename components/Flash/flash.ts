import confetti from 'canvas-confetti';

export type FlashEntry = {
  id: number;
  message: string;
  backgroundColor: string;
  isError: boolean;
};

type FlashListener = (entry: FlashEntry) => void;

const listeners = new Set<FlashListener>();
const queuedEntries: FlashEntry[] = [];
const elementWaiters = new Map<number, (element: HTMLElement | null) => void>();

let nextFlashId = 1;

export function subscribeFlash(listener: FlashListener) {
  listeners.add(listener);

  for (const entry of queuedEntries) {
    listener(entry);
  }
  queuedEntries.length = 0;

  return () => {
    listeners.delete(listener);
  };
}

export function flash(wat: unknown, bg = '#f80') {
  const entry: FlashEntry = {
    id: nextFlashId++,
    message: toFlashMessage(wat),
    backgroundColor: normalizeBackgroundColor(bg),
    isError: wat instanceof Error,
  };

  if (listeners.size === 0) {
    queuedEntries.push(entry);
  } else {
    for (const listener of listeners) {
      listener(entry);
    }
  }

  return entry.id;
}

export function notifyFlashElementReady(id: number, element: HTMLElement) {
  const waiter = elementWaiters.get(id);
  if (!waiter) return;

  elementWaiters.delete(id);
  waiter(element);
}

export async function celebrate(message: string) {
  const id = flash(`🎉 ${message} 🎉`, 'transparent');
  const element = await waitForFlashElement(id);

  const y = element
    ? (element.offsetTop + element.clientHeight / 2) /
      document.body.clientHeight
    : 0.2;

  await confetti({
    particleCount: 100,
    ticks: 100,
    spread: 90,
    angle: -20,
    origin: { x: 0, y },
  });
}

function normalizeBackgroundColor(bg: string) {
  if (bg === 'error') {
    return '#b3261e';
  }
  return bg;
}

function toFlashMessage(wat: unknown) {
  if (wat instanceof Error) {
    return wat.message;
  }

  if (wat instanceof Document) {
    const { body } = wat;
    if (body) {
      return body.textContent ?? body.innerHTML;
    }
    return wat.documentElement?.textContent ?? '';
  }

  if (wat instanceof Element) {
    return wat.textContent ?? wat.outerHTML;
  }

  if (wat instanceof DocumentFragment) {
    return wat.textContent ?? '';
  }

  if (typeof wat === 'string') {
    return wat;
  }

  try {
    return JSON.stringify(wat, null, 2);
  } catch {
    return String(wat);
  }
}

async function waitForFlashElement(id: number, timeoutMs = 1000) {
  return new Promise<HTMLElement | null>(resolve => {
    const timeout = setTimeout(() => {
      elementWaiters.delete(id);
      resolve(null);
    }, timeoutMs);

    elementWaiters.set(id, element => {
      clearTimeout(timeout);
      resolve(element);
    });
  });
}
