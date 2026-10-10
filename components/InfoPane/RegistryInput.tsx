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

async function checkRegistryStatus(
  registry: string,
  signal: AbortSignal,
  setStatus: (status: RegistryStatusType) => void,
  setRegistry: (registry: string) => void,
): Promise<void> {
  try {
    await fetch(`${registry}/_`, { method: 'HEAD', signal });
    if (!signal.aborted) {
      setStatus(RegistryStatus.ONLINE);
      setRegistry(registry);
    }
  } catch {
    if (!signal.aborted) {
      setStatus(RegistryStatus.OFFLINE);
    }
  }
}

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

  // eslint-disable-next-line react-doctor/no-fetch-in-effect -- The request is debounced and aborted in the cleanup, so it can't race
  useEffect(() => {
    const controller = new AbortController();
    setStatus(RegistryStatus.PENDING);
    const timer = setTimeout(
      // eslint-disable-next-line @typescript-eslint/strict-void-return -- It is void (promised)
      checkRegistryStatus,
      1000,
      value,
      controller.signal,
      setStatus,
      setRegistry,
    );
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
