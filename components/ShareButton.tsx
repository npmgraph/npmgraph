import React from 'react';
import { getCachedModule } from '../lib/ModuleCache.js';
import { flash } from '../lib/flash.js';
import useLocation from '../lib/useLocation.js';
import { useQuery } from './App.js';

import './ShareButton.scss';

export default function ShareButton() {
  const [query] = useQuery();
  const [location] = useLocation();

  // In most cases, we just share the current url
  let url = new URL(location);

  if (query.length == 1) {
    const module = getCachedModule(query[0]);
    if (module && module.package._local) {
      // If we have a single module, we can link directly to it
      url = module.getShareableLink();
    }
  }

  return (
    <div className="share-button">
      <button onClick={() => putOnPasteboard(url)} title="Copy link to diagram">
        <span className="material-icons">ios_share</span>{' '}
      </button>
    </div>
  );
}

function putOnPasteboard(content: unknown) {
  const type = 'text/plain';
  const blob = new Blob([String(content)], { type });
  const data = [new ClipboardItem({ [type]: blob })];

  navigator.clipboard.write(data).then(
    () => flash('Link copied to clipboard'),
    () => flash('Clipboard write failed'),
  );
}
