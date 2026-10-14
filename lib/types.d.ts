declare module '*?raw' {
  const value: string;
  export default value;
}

// Providing types for css modules here.  This works... sort of.  For some
// reason TS types the exports as `any`, despite the default export provided
// below.

declare module '*.module.css';
declare module '*.module.scss';
declare module '*.css';
declare module '*.scss';
declare module '*.svg?react';
