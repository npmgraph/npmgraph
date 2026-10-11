import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoadActivity from './LoadActivity.ts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LoadActivity#startFor', () => {
  it('stays active for the given duration', () => {
    const activity = new LoadActivity();
    const onChange = vi.fn<(activity: LoadActivity) => void>();
    activity.onChange = onChange;

    activity.startFor('Loading', 500);
    expect(activity.active).toBe(1);
    expect(activity.title).toBe('Loading');

    vi.advanceTimersByTime(499);
    expect(activity.active).toBe(1);

    vi.advanceTimersByTime(1);
    expect(activity.active).toBe(0);
    expect(activity.title).toBeUndefined();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('keeps quick activities visible', () => {
    const activity = new LoadActivity();
    const finish = activity.start('Fetching');

    activity.startFor('Loading', 500);
    finish();
    expect(activity.active).toBe(1);

    vi.advanceTimersByTime(500);
    expect(activity.active).toBe(0);
  });

  it('rejects negative durations', () => {
    expect(() => {
      new LoadActivity().startFor('Loading', -1);
    }).toThrow(RangeError);
  });
});
