import BugsnagLogo from '../images/partners/bugsnag.svg?react';
import GitHubLogo from '../images/partners/github.svg?react';
import NpmLogo from '../images/partners/npm.svg?react';
import * as styles from './StickerFarm.module.css';

const PARTNERS = [
  { name: 'npm', href: 'https://www.npmjs.com', Logo: NpmLogo },
  { name: 'GitHub', href: 'https://github.com', Logo: GitHubLogo },
  { name: 'Bugsnag', href: 'https://www.bugsnag.com', Logo: BugsnagLogo },
];

export default function StickerFarm() {
  return (
    <div className={styles.root}>
      <h2 className={styles.label}>Powered By</h2>
      <ul>
        {PARTNERS.map(({ name, href, Logo }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.logo}
            >
              <Logo width="100%" height="24" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
