import type Module from '../../lib/Module.ts';
import type { Maintainer } from '../../lib/Module.ts';
import { QueryType } from '../../lib/ModuleCache.ts';
import WarningIcon from '../../images/icons/warning.svg?react';
import { Section } from '../ui/Section.tsx';
import { Tag, Tags } from '../ui/Tag.tsx';

export function ModuleMaintainers({ module }: { module: Module }) {
  const { maintainers } = module;
  // Same condition as the "Modules with only one maintainer" report
  const isSolo = maintainers.length === 1 && !module.package.private;

  return (
    <Section
      title="Maintainers"
      count={maintainers.length}
      icon={
        isSolo ? (
          <WarningIcon role="img" aria-label="Single maintainer" />
        ) : null
      }
    >
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
