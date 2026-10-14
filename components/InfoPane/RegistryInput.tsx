import { useEffect, useState } from 'react';
import { DEFAULT_NPM_REGISTRY } from '../../lib/constants.ts';
import useRegistry from '../../hooks/useRegistry.ts';
import * as styles from './RegistryInput.module.scss';

const RegistryStatus = {
  PENDING: 'pending',
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

type CheckResult = { registry: string; online: boolean };

async function checkRegistryStatus(
  registry: string,
  signal: AbortSignal,
  setResult: (result: CheckResult) => void,
  setRegistry: (registry: string) => void,
): Promise<void> {
  try {
    await fetch(`${registry}/_`, { method: 'HEAD', signal });
    if (!signal.aborted) {
      setResult({ registry, online: true });
      setRegistry(registry);
    }
  } catch {
    if (!signal.aborted) {
      setResult({ registry, online: false });
    }
  }
}

export default function RegistryInput() {
  const [registry, setRegistry] = useRegistry();
  const [value, setValue] = useState(registry ?? '');
  const [result, setResult] = useState<CheckResult>();

  // A result only counts for the value it was checked against
  const status =
    result?.registry === value
      ? result.online
        ? RegistryStatus.ONLINE
        : RegistryStatus.OFFLINE
      : RegistryStatus.PENDING;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value.trim());
  }

  function handleBlur() {
    setRegistry(value);
  }

  // eslint-disable-next-line react-doctor/no-fetch-in-effect -- The request is debounced and aborted in the cleanup, so it can't race
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      // eslint-disable-next-line @typescript-eslint/strict-void-return -- It is void (promised)
      checkRegistryStatus,
      1000,
      value,
      controller.signal,
      setResult,
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
