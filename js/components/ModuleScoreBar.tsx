import React from 'react';

export function ModuleScoreBar({
  title,
  score,
  style,
}: {
  title: string;
  score: number;
  style?: React.CSSProperties;
}) {
  const perc = (score * 100).toFixed(0) + '%';
  const inner = (
    <div
      style={{
        width: perc,
        textAlign: 'right',
        backgroundColor: `hsl(${score * 120}, 75%, 70%)`,
        ...style,
      }}
    >
      {perc}
    </div>
  );

  return (
    <>
      <span style={{ marginRight: '1em', ...style }}>{title}</span>
      <div
        className="score-bar"
        style={{ border: 'solid 1px #ccc', width: '200px' }}
      >
        {inner}
      </div>
    </>
  );
}
