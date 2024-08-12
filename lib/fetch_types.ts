export type NPMSIOData = {
  analyzedAt: string;
  collected: {
    metadata: {
      name: string;
      scope: string;
      version: string;
      description: string;
      date: string;
      author: {
        name: string;
      };
      publisher: {
        username: string;
        email: string;
      };
      maintainers: { username: string; email: string }[];
      contributors: { name: string; email: string }[];
      repository: { type: string; url: string };
      links: {
        npm: string;
        homepage: string;
        repository: string;
        bugs: string;
      };

      license: string;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
      releases: {
        from: string;
        to: string;
        count: number;
      }[];
      hasTestScript: boolean;
      readme: string;
    };
    npm: {
      downloads: {
        from: string;
        to: string;
        count: number;
      }[];
      starsCount: number;
    };
    github: {
      starsCount: number;
      forksCount: number;
      subscribersCount: number;
      issues: {
        count: number;
        openCount: number;
        distribution: Record<string, number>;
        isDisabled: boolean;
      };
      contributors: {
        username: string;
        commitsCount: number;
      }[];
      commits: {
        from: string;
        to: string;
        count: number;
      }[];
      statuses: {
        context: string;
        state: string;
      }[];
    };
    source: {
      files: {
        readmeSize: number;
        testsSize: number;
        hasNpmIgnore: boolean;
      };
      coverage: number;
      outdatedDependencies: Record<
        string,
        {
          required: string;
          stable: string;
          latest: string;
        }
      >;
    };
  };
  evaluation: {
    quality: {
      carefulness: number;
      tests: number;
      health: number;
      branding: number;
    };
    popularity: {
      communityInterest: number;
      downloadsCount: number;
      downloadsAcceleration: number;
      dependentsCount: number;
    };
    maintenance: {
      releasesFrequency: number;
      commitsFrequency: number;
      openIssues: number;
      issuesDistribution: number;
    };
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
};

export type BundlePhobiaData = {
  assets: {
    gzip: number;
    name: string;
    size: number;
    type: string;
  }[];
  dependencyCount: number;
  // dependencySizes may be undefined, but making it optional here causes TS to
  // complain when trying to pick it's type of this structure with
  // `BundlePhobiaData['dependencySizes'][number]`.
  dependencySizes: { approximateSize: number; name: string }[];
  description: string;
  gzip: number;
  hasJSModule: boolean;
  hasJSNext: boolean;
  hasSideEffects: boolean;
  isModuleType: boolean;
  name: string;
  repository: string;
  scoped: boolean;
  size: number;
  version: string;
};
