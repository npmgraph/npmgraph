import type Module from '../../lib/Module.ts';
import type { Maintainer } from '../../lib/Module.ts';
import { QueryType } from '../../lib/ModuleCache.ts';
import { Section } from '../ui/Section.tsx';
import { Tag, Tags } from '../ui/Tag.tsx';

export function ModuleMaintainers({ module }: { module: Module }) {
  const { maintainers } = module;

  return (
    <Section title="Maintainers" count={maintainers.length}>
      <Tags>
        {maintainers.map(
          // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment -- Incorrect types
          ({ name = 'Unknown', email }: Exclude<Maintainer, string>) => (
            <Tag
              key={name + email}
              type={QueryType.Maintainer}
              value={name}
              gravatar={email}
            />
          ),
        )}
      </Tags>
    </Section>
  );
}
