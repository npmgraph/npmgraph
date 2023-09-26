import React from 'react';
import { uncacheModule, useLocalModules } from '../../lib/ModuleCache.js';
import { QueryLink } from '../QueryLink.js';
import { Section } from '../Section.js';

import './FileUploadList.scss';

export default function FileUploadList() {
  const [localModules] = useLocalModules();
  return (
    <Section title="Previous Uploads" id="local-modules">
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
