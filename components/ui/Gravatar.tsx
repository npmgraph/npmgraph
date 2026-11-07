import { type ImgHTMLAttributes, Suspense, use } from 'react';
import usePromise from '../../hooks/usePromise.ts';
import { SectionOpenedContext } from './SectionOpenedContext.ts';
import * as styles from './Gravatar.module.css';

const sha256 = async (text: string) => {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

type GravatarProps = {
  email: string;
  size?: number;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

export function Gravatar({ email, size = 32, ...props }: GravatarProps) {
  const sectionOpened = use(SectionOpenedContext);
  const hashPromise = usePromise(email, async () => {
    // Avatars in sections that were never opened aren't hashed or loaded
    await sectionOpened;
    return sha256(email.trim().toLowerCase());
  });

  return (
    <Suspense
      fallback={
        <span
          data-gravatar
          className={styles.placeholder}
          style={{ width: size, height: size }}
        />
      }
    >
      <GravatarImage hashPromise={hashPromise} size={size} {...props} />
    </Suspense>
  );
}

function GravatarImage({
  hashPromise,
  size = 32,
  ...props
}: Omit<GravatarProps, 'email'> & { hashPromise: Promise<string> }) {
  const hash = use(hashPromise);

  return (
    <img
      data-gravatar
      loading="lazy"
      width={size}
      height={size}
      // Decorative, the name is always shown next to it
      alt=""
      src={`https://www.gravatar.com/avatar/${hash}?s=${size * 2}`}
      {...props}
    />
  );
}
