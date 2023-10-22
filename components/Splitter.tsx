import React from 'react';

import './Splitter.scss';

export function Splitter({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <div id="splitter" className="bright-hover tab" onClick={onClick}>
      {isOpen ? '✗' : '\u{25c0}'}
    </div>
  );
}
