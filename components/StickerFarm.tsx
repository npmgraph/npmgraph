import BugsnagLogo from '../images/partners/bugsnag.svg?react';
import GitHubLogo from '../images/partners/github.svg?react';
import NpmLogo from '../images/partners/npm.svg?react';
import VercelLogo from '../images/partners/vercel.svg?react';
import * as styles from './StickerFarm.module.scss';

const PARTNERS = [
  { name: 'npm', href: 'https://www.npmjs.com', Logo: NpmLogo },
  { name: 'GitHub', href: 'https://github.com', Logo: GitHubLogo },
  { name: 'Vercel', href: 'https://vercel.com', Logo: VercelLogo },
  { name: 'Bugsnag', href: 'https://www.bugsnag.com', Logo: BugsnagLogo },
];

export default function StickerFarm() {
  return (
    <div className={styles.root}>
      <span className={styles.label}>Powered By</span>
      <ul>
        {PARTNERS.map(({ name, href, Logo }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.logo}
            >
              <Logo width="auto" height="20" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
