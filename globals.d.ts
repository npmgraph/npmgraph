declare const process: {
  exitCode: number;
  env: {
    VERCEL_ENV?: string;
    VERCEL_GIT_COMMIT_SHA?: string;
    VERCEL_GIT_PULL_REQUEST_ID?: string;
    BUGSNAG_KEY?: string;
  };
};
