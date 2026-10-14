import { Suspense, use, useEffect, useState } from 'react';
import { DEFAULT_NPM_REGISTRY } from '../../lib/constants.ts';
import usePromise from '../../hooks/usePromise.ts';
import useRegistry from '../../hooks/useRegistry.ts';
import * as styles from './RegistryInput.module.scss';

const CHECKING = 'Checking...';

async function isRegistryOnline(registry: string): Promise<boolean> {
  try {
    await fetch(`${registry}/_`, { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
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
    if (isOnline) {
      setRegistry(registry);
    }
  }, [isOnline, registry, setRegistry]);

  return isOnline ? '✅ Online' : '❌ Offline';
}

export default function RegistryInput() {
  const [registry, setRegistry] = useRegistry();
  const [value, setValue] = useState(registry ?? '');
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
      <span>Registry:</span>
      <input
        type="text"
        value={value}
        placeholder={DEFAULT_NPM_REGISTRY}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <span className={styles.status}>
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
