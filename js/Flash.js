export default function(o, bg = '#f80') {
  const SPACE = 10;

  const graph = document.querySelector('#graph');
  const prev = document.querySelector('.flash:last-of-type');
  const el = document.createElement('div');

  if (o instanceof Error) {
    el.classList.add('error');
    el.innerText = o.message + '\n' + o.stack;
  } else if (o instanceof Document) {
    el.append.apply(el, o.querySelector('body').children);
  } else if (o instanceof Element || o instanceof DocumentFragment) {
    el.append(o);
  } else if (typeof(o) == 'string') {
    el.innerText = o;
  } else {
    el.innerText = JSON.stringify(o, null, 2);
  }

  document.body.appendChild(el);
  el.classList.add('flash');
  const prevBottom = prev ? (prev.offsetTop + prev.offsetHeight) : 0;

  const top = prevBottom < window.innerHeight - el.offsetHeight ? prevBottom : 0;
  el.style.top = `${top + SPACE/2}px`;
  el.style.left = `${-el.offsetWidth - SPACE}px`;
  el.style.maxWidth = `${graph.offsetWidth - SPACE}px`;
  el.style.backgroundColor = bg;

  setTimeout(() => {
    el.style.left = `${SPACE}px`;

    setTimeout(() => {
      el.addEventListener('transitionend', () =>  el.remove());
      el.style.left = `${-el.offsetWidth - SPACE}px`;
    }, 5e3);
  }, 0);
}
