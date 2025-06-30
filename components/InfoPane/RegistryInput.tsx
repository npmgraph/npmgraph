import { useEffect, useState } from 'react';
import { DEFAULT_NPM_REGISTRY } from '../../lib/constants.js';
import useRegistry from '../../lib/useRegistry.js';
import styles from './RegistryInput.module.scss';

enum RegistryStatus {
  PENDING = 'pending',
  ONLINE = 'online',
  OFFLINE = 'offlinegs',
}

export default function RegistryInput() {
  const [registry, setRegistry] = useRegistry();
  const [value, setValue] = useState(registry ?? '');
  const [status, setStatus] = useState<RegistryStatus>(RegistryStatus.PENDING);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value.trim());
  }

  function handleBlur() {
    setRegistry(value);
  }

  function checkRegistryStatus(registry: string, signal: AbortSignal) {
    if (signal.aborted) return;

    fetch(`${registry}/_`, { method: 'HEAD', signal })
      .then(() => {
        setStatus(RegistryStatus.ONLINE);
        setRegistry(registry);
      })
      .catch(() => setStatus(RegistryStatus.OFFLINE));
  }

  useEffect(() => {
    const controller = new AbortController();
    setStatus(RegistryStatus.PENDING);
    setTimeout(() => checkRegistryStatus(value, controller.signal), 1000);
    return () => controller.abort();
  }, [value]);

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
