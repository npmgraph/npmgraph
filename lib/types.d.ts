// Keep VSCode from complaining about Parcel "bundle inlining" imports
// Ref: https://github.com/parcel-bundler/parcel/discussions/7084
declare module 'bundle-text:*' {
  const value: string;
  export default value;
}
