// Keep VSCode from complaining about Parcel "bundle inlining" imports
// Ref: https://github.com/parcel-bundler/parcel/discussions/7084
declare module 'bundle-text:*' {
  const value: string;
  export default value;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module 'jsx:*';
