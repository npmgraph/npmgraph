declare module '*?raw' {
  const value: string;
  export default value;
}

// Providing types for css modules here.  This works... sort of.  For some
// reason TS types the exports as `any`, despite the default export provided
// below.

declare module '*.module.css';
declare module '*.css';
declare module '*.svg?react';
