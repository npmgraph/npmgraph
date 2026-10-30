import { type HTMLAttributes, Suspense, use } from 'react';
import usePromise from '../../hooks/usePromise.ts';
import { cn } from '../../lib/dom.ts';
import * as styles from './Gravatar.module.scss';

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
  username: string;
  size?: number;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'role' | 'aria-label'>;

export function Gravatar({ email, ...props }: GravatarProps) {
  const hashPromise = usePromise(email, async () =>
    sha256(email.trim().toLowerCase()),
  );

  return (
    <Suspense fallback={null}>
      <GravatarImage hashPromise={hashPromise} {...props} />
    </Suspense>
  );
}

// Not an <img> because React attaches load and error listeners to every one of them
function GravatarImage({
  hashPromise,
  username,
  size = 32,
  className,
  style,
  ...props
}: Omit<GravatarProps, 'email'> & { hashPromise: Promise<string> }) {
  const hash = use(hashPromise);

  return (
    <span
      role="img"
      aria-label={`${username}'s avatar`}
      className={cn(styles.root, className)}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(https://www.gravatar.com/avatar/${hash}?s=${size * 2})`,
        ...style,
      }}
      {...props}
    />
  );
}
