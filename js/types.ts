export type Person = {
  name: string,
  email: string,
}

export type OldLicense = {
  type: string,
  url: string
}

// TODO: Actual schema for NPM module info is pretty complex.  This is just a
// quick pass at the types we currently care about
export type ModuleInfo = {
  version: string,
  name: string,
  author?: Person,
  maintainers?: Person[],
  repository?: {
    type: 'git',
    url: string,
  },
  bugs?: {
    url: string,
  },
  description?: string,
  homepage?: string,
  keywords?: string[],
  unpublished?: boolean,
  license?: string,
  licenses?: OldLicense[],
  contributors?: Person[],

  // Only for versionless-repository requests
  versions?: ModuleInfo[];
};
