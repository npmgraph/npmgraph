import React from 'react';
import { QueryLink } from '../components/QueryLink.js';
import { Section } from '../components/Section.js';
import { uncacheModule, useLocalModules } from '../util/ModuleCache.js';

import './LocalModuleList.scss';

export default function LocalModuleList() {
  const [localModules] = useLocalModules();
  return (
    <Section title="Previous uploads" id="local-modules">
      {localModules.map(module => {
        return (
          <li key={module.name}>
            <QueryLink query={module.key} />
            <button
              className="delete"
              onClick={() => uncacheModule(module.key)}
            >
              remove
            </button>
          </li>
        );
      })}
    </Section>
  );
}
