import React from 'react';

export function Splitter({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <div id="splitter" className="bright-hover" onClick={onClick}>
      {isOpen ? '✗' : '\u{25c0}'}
    </div>
  );
}
