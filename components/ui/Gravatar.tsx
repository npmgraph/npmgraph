import { type ImgHTMLAttributes, useEffect, useState } from 'react';

const sha256 = async (text: string) => {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export function Gravatar({
  email,
  username,
  size = 32,
  ...props
}: {
  email: string;
  username: string;
  size?: number;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
  const [hash, setHash] = useState<string>();

  useEffect(() => {
    let isIgnore = false;

    void sha256(email.trim().toLowerCase()).then(nextHash => {
      if (!isIgnore) {
        setHash(nextHash);
      }
    });

    return () => {
      isIgnore = true;
    };
  }, [email]);

  return (
    hash && (
      <img
        loading="lazy"
        width={size}
        height={size}
        alt={`${username}'s avatar`}
        src={`https://www.gravatar.com/avatar/${hash}?s=${size * 2}`}
        {...props}
      />
    )
  );
}
