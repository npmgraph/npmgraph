import React from 'react';

import './Splitter.scss';

const blackRightPointingTriangle = '\u{25b6}';
const blackLeftPointingTriangle = '\u{25c0}';

export function Splitter({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <div id="splitter" className="bright-hover tab" onClick={onClick}>
      {isOpen ? blackRightPointingTriangle : blackLeftPointingTriangle}
    </div>
  );
}
