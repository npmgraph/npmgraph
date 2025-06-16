// Keep VSCode from complaining about Parcel "bundle inlining" imports
// Ref: https://github.com/parcel-bundler/parcel/discussions/7084
declare module 'bundle-text:*' {
  const value: string;
  export default value;
}

// Providing types for css modules here.  This works... sort of.  For some
// reason TS types the exports as `any`, despite the default export provided
// below.

declare module '*.module.css';
declare module '*.module.scss';
declare module 'jsx:*';
