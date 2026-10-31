import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import type { ImgHTMLAttributes } from 'react';

type GravatarProps = {
  email: string;
  username: string;
  size?: number;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

export function Gravatar({
  email,
  username,
  size = 32,
  ...props
}: GravatarProps) {
  const normalized = email.trim().toLowerCase();
  const hash = bytesToHex(sha256(utf8ToBytes(normalized)));

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
