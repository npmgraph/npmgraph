/**
 * DOM maniulation methods
 */
type LoadActivityFn = (la: LoadActivity) => void;

/**
 * Lite class for tracking async activity
 */
export default class LoadActivity {
  title: string | null = '';

  total = 0;
  active = 0;
  onChange: LoadActivityFn | null = null;

  get percent() {
    return `${(1 - this.active / this.total) * 100}%`;
  }

  start(title: string): () => void {
    if (title) this.title = title;
    this.total++;
    this.active++;
    this.onChange?.(this);

    let _finished = false;
    return () => {
      if (_finished) return;
      _finished = true;
      this.active--;
      if (!this.active) {
        this.total = 0;
        this.title = null;
      }
      this.onChange?.(this);
    };
  }
}
