import CheckCircleFillIcon from 'octicons-plain-react/CheckCircleFill';
import XCircleFillIcon from 'octicons-plain-react/XCircleFill';
import { Suspense, use, useEffect, useId, useState } from 'react';
import useDebouncedValue from '../../hooks/useDebouncedValue.ts';
import usePromise from '../../hooks/usePromise.ts';
import useRegistry from '../../hooks/useRegistry.ts';
import { DEFAULT_NPM_REGISTRY } from '../../lib/constants.ts';
import * as styles from './RegistryInput.module.css';

const CHECKING = 'Checking...';

async function isRegistryOnline(registry: string): Promise<boolean> {
  try {
    await fetch(`${registry}/_`, { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}

function RegistryStatus({
  registry,
  check,
  setRegistry,
}: {
  registry: string;
  check: Promise<boolean>;
  setRegistry: (registry: string) => void;
}) {
  const isOnline = use(check);

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- Reacts to the async result of the check, not to a user event
    if (isOnline) {
      setRegistry(registry);
    }
  }, [isOnline, registry, setRegistry]);

  return isOnline ? (
    <>
      <CheckCircleFillIcon className={styles.online} /> Online
    </>
  ) : (
    <>
      <XCircleFillIcon className={styles.offline} /> Offline
    </>
  );
}

export default function RegistryInput() {
  const inputId = useId();
  const [registry = '', setRegistry] = useRegistry();
  const [value, setValue] = useState(registry);
  const debouncedValue = useDebouncedValue(value, 1000);
  const check = usePromise(debouncedValue, async () =>
    isRegistryOnline(debouncedValue),
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value.trim());
  }

  function handleBlur() {
    setRegistry(value);
  }

  return (
    <div className={styles.root}>
      <label htmlFor={inputId}>Registry:</label>
      <input
        id={inputId}
        type="text"
        value={value}
        placeholder={DEFAULT_NPM_REGISTRY}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <span className={styles.status} role="status">
        {value === debouncedValue ? (
          <Suspense fallback={CHECKING}>
            <RegistryStatus
              registry={debouncedValue}
              check={check}
              setRegistry={setRegistry}
            />
          </Suspense>
        ) : (
          CHECKING
        )}
      </span>
    </div>
  );
}
