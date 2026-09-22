/**
 DOM maniulation methods
 */
type LoadActivityFn = (la: LoadActivity) => void;

/**
 Lite class for tracking async activity
 */
export default class LoadActivity {
  title: string | undefined = '';

  total = 0;
  active = 0;
  onChange: LoadActivityFn | undefined;

  start(title: string): () => void {
    if (title) {
      this.title = title;
    }

    this.total++;
    this.active++;
    this.onChange?.(this);

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

      this.onChange?.(this);
    };
  }
}
