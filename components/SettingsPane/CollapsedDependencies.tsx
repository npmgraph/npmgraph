import useCollapse from '../../hooks/useCollapse.ts';
import { Section } from '../ui/Section.tsx';

export default function CollapsedDependencies() {
  const [collapse, setCollapse] = useCollapse();

  if (collapse.length === 0) {
    return null;
  }

  return (
    <Section title="Collapsed dependencies">
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {collapse.map(name => (
          <li key={name}>
            <span>{name}</span>{' '}
            <button
              type="button"
              aria-label={`Remove ${name} from collapsed dependencies`}
              onClick={() => {
                setCollapse(collapse.filter(item => item !== name));
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
