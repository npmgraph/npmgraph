import BugsnagLogo from 'jsx:../images/partners/bugsnag.svg';
import GitHubLogo from 'jsx:../images/partners/github.svg';
import NpmLogo from 'jsx:../images/partners/npm.svg';
import VercelLogo from 'jsx:../images/partners/vercel.svg';
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
              <Logo />
              <span>{name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
