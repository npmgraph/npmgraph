import React, { type HTMLProps } from 'react';
import { Pane } from '../Pane.js';
import './AboutPane.scss';
import { CommitList } from './CommitList.js';

export default function AboutPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <CommitList />
    </Pane>
  );
}
