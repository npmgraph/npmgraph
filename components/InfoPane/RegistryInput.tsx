import { useEffect, useState } from 'react';
import { DEFAULT_NPM_REGISTRY } from '../../lib/constants.ts';
import useRegistry from '../../hooks/useRegistry.ts';
import * as styles from './RegistryInput.module.scss';

const RegistryStatus = {
  PENDING: 'pending',
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

type RegistryStatus = (typeof RegistryStatus)[keyof typeof RegistryStatus];

export default function RegistryInput() {
  const [registry, setRegistry] = useRegistry();
  const [value, setValue] = useState(registry ?? '');
  const [status, setStatus] = useState<RegistryStatus>(RegistryStatus.PENDING);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value.trim());
  }

  useEffect(() => {
    let isCancelled = false;

    async function checkRegistry() {
      setStatus(RegistryStatus.PENDING);

      try {
        const response = await fetch(value || DEFAULT_NPM_REGISTRY, {
          method: 'HEAD',
        });

        if (!isCancelled) {
          setStatus(
            response.ok ? RegistryStatus.ONLINE : RegistryStatus.OFFLINE,
          );
        }
      } catch {
        if (!isCancelled) {
          setStatus(RegistryStatus.OFFLINE);
        }
      }
    }

    void checkRegistry();

    return () => {
      isCancelled = true;
    };
  }, [value]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegistry(value || DEFAULT_NPM_REGISTRY);
  }

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <input
        value={value}
        placeholder={DEFAULT_NPM_REGISTRY}
        aria-label="NPM registry"
        onChange={handleChange}
      />
      <button type="submit">Set Registry</button>
      <span data-status={status}>{status}</span>
    </form>
  );
}
