import './Splitter.scss';

const blackRightPointingTriangle = '\u{25B6}';

export function Splitter({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <div
      id="splitter"
      className="bright-hover tab"
      onClick={onClick}
      aria-hidden={!isOpen}
    >
      {blackRightPointingTriangle}
    </div>
  );
}
