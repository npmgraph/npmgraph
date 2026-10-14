// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- needed for declaration merging
interface ImportMeta {
  readonly env: {
    readonly VERCEL_ENV?: string;
    readonly VERCEL_GIT_COMMIT_SHA?: string;
    readonly VERCEL_GIT_PULL_REQUEST_ID?: string;
    readonly BUGSNAG_KEY?: string;
  };
}
