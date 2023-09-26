export default class ElementSet<T extends Element> extends Array<T> {
  on(...args: [string, () => () => void]) {
    const els = [...this];

    for (const el of els) {
      el.addEventListener(...args);
    }

    return function () {
      for (const el of els) {
        el.removeEventListener(...args);
      }
    };
  }

  clear(): void {
    return this.forEach(el => ((el as unknown as HTMLElement).innerText = ''));
  }

  remove(): void {
    return this.forEach(el => el.remove());
  }

  contains(el: T): boolean {
    return this.find(n => n.contains(el)) ? true : false;
  }

  attr(k: string, v?: string) {
    if (arguments.length == 1) {
      return this[0]?.getAttribute(k);
    } else if (v == null) {
      this.forEach(el => el.removeAttribute(k));
    } else {
      this.forEach(el => el.setAttribute(k, v));
    }
  }

  get textContent(): string {
    return this[0]?.textContent ?? '';
  }

  set textContent(str) {
    this.forEach(el => (el.textContent = str));
  }

  get innerText(): string {
    return (this[0] as unknown as HTMLElement)?.innerText;
  }

  set innerText(str) {
    this.forEach(el => ((el as unknown as HTMLElement).innerText = str));
  }

  get innerHTML(): string {
    return this[0]?.innerHTML;
  }

  set innerHTML(str) {
    this.forEach(el => (el.innerHTML = str));
  }

  appendChild(nel: Text | Element) {
    if (typeof nel == 'string') nel = document.createTextNode(nel);
    return this.forEach((el, i) => {
      el.appendChild(i > 0 ? nel : nel.cloneNode(true));
    });
  }
}
