import { useEffect, useState } from 'react';
import { DEFAULT_NPM_REGISTRY } from '../../lib/constants.ts';
import useRegistry from '../../hooks/useRegistry.ts';
import * as styles from './RegistryInput.module.scss';

const RegistryStatus = {
  PENDING: 'pending',
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

type RegistryStatusType = (typeof RegistryStatus)[keyof typeof RegistryStatus];

export default function RegistryInput() {
  const [registry, setRegistry] = useRegistry();
  const [value, setValue] = useState(registry ?? '');
  const [status, setStatus] = useState<RegistryStatusType>(
    RegistryStatus.PENDING,
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value.trim());
  }

  function handleBlur() {
    setRegistry(value);
  }

  useEffect(() => {
    const controller = new AbortController();
    setStatus(RegistryStatus.PENDING);

    async function checkRegistryStatus() {
      try {
        await fetch(`${value}/_`, {
          method: 'HEAD',
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setStatus(RegistryStatus.ONLINE);
          setRegistry(value);
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus(RegistryStatus.OFFLINE);
        }
      }
    }

    const timer = setTimeout(() => {
      void checkRegistryStatus();
    }, 1000);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [setRegistry, value]);

  const statusText =
    status === RegistryStatus.ONLINE
      ? '✅ Online'
      : status === RegistryStatus.OFFLINE
        ? '❌ Offline'
        : 'Checking...';

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
      <span className={styles.status}>{statusText}</span>
    </div>
  );
}
