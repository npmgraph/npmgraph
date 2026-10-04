declare const process: {
  exitCode: number;
  env: {
    VERCEL_GIT_PULL_REQUEST_ID?: string;
    BUGSNAG_KEY?: string;
  };
};
