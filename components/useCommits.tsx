import fetchJSON from '../lib/fetchJSON.js';
import { GithubCommit } from '../lib/fetch_types.js';
import sharedStateHook from '../lib/sharedStateHook.js';

const lastVisit = Number(localStorage.getItem('lastVisit'));

const [useCommitState, setCommitState] = sharedStateHook<GithubCommit[]>([]);
const [useLastVisit, setLastVisit] = sharedStateHook(lastVisit);

export async function fetchCommits() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    let commits = await fetchJSON<GithubCommit[]>(
      `https://api.github.com/repos/npmgraph/npmgraph/commits?since=${since.toISOString()}`,
      { silent: true },
    );

    // Filter out merge commits
    commits = commits.filter(commit => !/^merge/i.test(commit.commit.message));

    setCommitState(commits);
  } catch (err) {
    // This is non-essential so don't cmoplain too loudly
    console.warn('Request for project commits failed');
  }
}

export default function useCommits() {
  const [commits] = useCommitState();
  const [lastVisit] = useLastVisit();
  let newCount = 0;
  for (const commit of commits) {
    const date = Date.parse(commit.commit.author.date);
    commit.isNew = !isNaN(date) && date > lastVisit;
    newCount += commit.isNew ? 1 : 0;
  }

  function reset() {
    const now = Date.now();
    localStorage.setItem('lastVisit', String(now));
    setLastVisit(now);
  }

  return [commits, newCount, reset] as const;
}
