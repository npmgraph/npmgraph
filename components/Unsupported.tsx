import { ExternalLink } from './ExternalLink.js';
import { GithubIcon } from './Icons.js';

import styles from './Unsupported.module.scss';

export function Unsupported({
  unsupported,
  ...props
}: { unsupported: JSX.Element[] } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.root} {...props}>
      <h1>Unsupported Features</h1>
      <p>
        It looks like your browser may have trouble running NPMGraph.
        Specifically, the following features appear to be missing or disabled:
      </p>
      <ul>
        {unsupported.map((feature, i) => (
          <li key={i}>{feature}</li>
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
    </div>
  );
}
