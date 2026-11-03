import type { HTMLProps } from 'react';
import { cn } from '../../lib/dom.ts';
import { Pane } from '../ui/Pane.tsx';
import InputHelp from '../InputHelp.tsx';
import * as utilities from '../ui/utilities.module.scss';
import FilePicker from './FilePicker.tsx';
import ErrorsBox from './ErrorsBox.tsx';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <ErrorsBox />

      <InputHelp heading="npmgraph supports looking up:" />

      <p>It also accepts package.json:</p>
      <ul>
        <li>Drag and drop a file anywhere on the page</li>
        <li>Paste package.json (file or text)</li>
        <li>
          <FilePicker label="Choose file" /> from your computer
        </li>
      </ul>

      <hr />
      <footer>
        <p>
          <a
            href="https://github.com/npmgraph/npmgraph"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(utilities.brightHover, 'external-link')}
          >
            GitHub repo
          </a>
          {' | '}
          <a
            href="https://github.com/sponsors/broofa"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(utilities.brightHover, 'external-link')}
          >
            Sponsor
          </a>
        </p>
      </footer>
    </Pane>
  );
}
