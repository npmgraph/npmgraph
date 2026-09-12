type PeerDependenciesMeta = Record<string, { optional?: boolean } | undefined>;

export function isOptionalPeerDependency(
  peerDependenciesMeta: PeerDependenciesMeta | undefined,
  dependencyName: string,
) {
  return peerDependenciesMeta?.[dependencyName]?.optional === true;
}
