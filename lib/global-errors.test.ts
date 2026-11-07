import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flash } from './flash.ts';
import { handleGlobalError } from './global-errors.ts';

vi.mock('./flash.ts', () => ({ flash: vi.fn() }));

beforeEach(() => {
  vi.mocked(flash).mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const errorEvent = (init: Partial<ErrorEvent>) =>
  ({
    message: '',
    filename: '',
    lineno: 0,
    error: null,
    ...init,
  }) as ErrorEvent;

describe('handleGlobalError', () => {
  it('flashes errors from our own scripts', () => {
    handleGlobalError(
      errorEvent({
        message: 'Uncaught TypeError: x is undefined',
        filename: 'https://npmgraph.js.org/index.js',
        lineno: 12,
        error: new TypeError('x is undefined'),
      }),
    );

    expect(flash).toHaveBeenCalledWith('Uncaught TypeError: x is undefined');
  });

  it('ignores opaque cross-origin "Script error." events', () => {
    handleGlobalError(errorEvent({ message: 'Script error.' }));

    expect(flash).not.toHaveBeenCalled();
  });
});
