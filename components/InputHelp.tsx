import { QueryLink } from './ui/QueryLink.tsx';

export default function InputHelp({
  heading = 'For example:',
}: {
  heading?: string;
}) {
  return (
    <>
      <p>{heading}</p>

      <ul>
        <li>
          A npm module name: <QueryLink query={['express']} />
        </li>
        <li>
          Multiple, versioned module names:{' '}
          <QueryLink query={['cross-env@6', 'rimraf']} />
        </li>
        <li>
          A GitHub repository shorthand: <QueryLink query="sindresorhus/type-fest">sindresorhus/type-fest</QueryLink>
        </li>
        <li>
          A URL to a{' '}
          <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
            package.json file
          </QueryLink>
        </li>
      </ul>
    </>
  );
}
