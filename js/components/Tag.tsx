import md5 from 'md5';
import React, { HTMLProps } from 'react';
import { selectTag } from '../Graph.js';
import { tagify } from '../util/dom.js';

export function Tag({
  type,
  name,
  count = 0,
  gravatar,
  className,
}: {
  name: string;
  type: string;
  count?: number;
  gravatar?: string;
} & HTMLProps<HTMLDivElement>) {
  let title = name;
  if (count > 1) title += ` (${count})`;

  let img = null;
  if (gravatar) {
    const hash = md5(gravatar);
    img = <img src={`https://www.gravatar.com/avatar/${hash}?s=32`} />;
  }

  return (
    <div
      className={`tag ${type} bright-hover ${className ?? ''}`}
      title={title}
      onClick={() => selectTag(tagify(type, name), true, true)}
    >
      {img}
      {title}
    </div>
  );
}
