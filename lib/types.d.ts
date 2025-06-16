// Keep VSCode from complaining about Parcel "bundle inlining" imports
// Ref: https://github.com/parcel-bundler/parcel/discussions/7084
declare module 'bundle-text:*' {
  const value: string;
  export default value;
}

// Providing types for css modules here.  This works... sort of.  For some
// reason TS types the exports as `any`, despite the default export provided
// below.

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
declare module '*.module.scss' {
  const styles: Record<string, string>;
  export default styles;
}

declare module 'jsx:*';
