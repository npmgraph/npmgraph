import { ExternalLink } from './ExternalLink.js';
import { GithubIcon } from './Icons.js';

import * as styles from './Unsupported.module.scss';

const imageUrl = new URL('../images/sad_kilroy.png', import.meta.url);

export function Unsupported({
  unsupported,
  ...props
}: {
  unsupported: Map<string, JSX.Element>;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.root} {...props}>
      <h1>Unsupported Features</h1>
      <p>
        It looks like your browser may have trouble running NPMGraph.
        Specifically, the following features appear to be missing or disabled:
      </p>
      <ul>
        {[...unsupported.entries()].map(([name, jsx]) => (
          <li key={name}>{jsx}</li>
        ))}
      </ul>
      <p>
        Make sure you're using a modern version of Chrome, Firefox, Safari, or
        Edge, and that cookies are enabled.
      </p>

      <p className={styles.footer}>
        <ExternalLink
          href="https://github.com/npmgraph/npmgraph"
          icon={GithubIcon}
        >
          NPMGraph on GitHub
        </ExternalLink>
      </p>

      <img className={styles.sad_kilroy} width="100" src={imageUrl.href} />
    </div>
  );
}
