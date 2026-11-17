type Listener = () => void;

/**
Lite class for tracking async activity
*/
export default class LoadActivity {
  readonly #listeners = new Set<Listener>();
  title: string | undefined = '';

  total = 0;
  active = 0;
  // Changes on every update, for `useSyncExternalStore()`
  version = 0;

  subscribe = (listener: Listener) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  #notify() {
    this.version++;
    for (const listener of this.#listeners) {
      listener();
    }
  }

  start(title: string): () => void {
    if (title) {
      this.title = title;
    }

    this.total++;
    this.active++;
    this.#notify();

    let _isFinished = false;
    return () => {
      if (_isFinished) {
        return;
      }

      _isFinished = true;
      this.active--;
      if (!this.active) {
        this.total = 0;
        this.title = undefined;
      }

      this.#notify();
    };
  }

  /**
  Show activity for a fixed time, so that quick actions still give feedback
  */
  startFor(title: string, duration = 500): void {
    if (duration < 0) {
      throw new RangeError('duration must not be negative');
    }

    setTimeout(this.start(title), duration);
  }
}
