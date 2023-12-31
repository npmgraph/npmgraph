import { ExternalLink } from './ExternalLink.js';
import { GithubIcon } from './Icons.js';

export function Unsupported() {
  return (
    <div className="unsupported">
      <h1>Unsupported Browser</h1>
      <p>
        NPMGraph requires a browser with modern JavaScript features. Please try
        the latest version of Chrome, Firefox, Safari, or Edge.
      </p>

      <p>
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
