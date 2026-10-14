import { type ImgHTMLAttributes, Suspense, use } from 'react';
import usePromise from '../../hooks/usePromise.ts';

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
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

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

function GravatarImage({
  hashPromise,
  username,
  size = 32,
  ...props
}: Omit<GravatarProps, 'email'> & { hashPromise: Promise<string> }) {
  const hash = use(hashPromise);

  return (
    <img
      loading="lazy"
      width={size}
      height={size}
      alt={`${username}'s avatar`}
      src={`https://www.gravatar.com/avatar/${hash}?s=${size * 2}`}
      {...props}
    />
  );
}
