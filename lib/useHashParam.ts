import useLocation from './useLocation.js';

export default function useHashParam<T extends string>(
  paramName: string,
): readonly [val: T, set: (val: T) => void] {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const value = (params.get(paramName) ?? '') as T;

  const setValue = (val: T) => {
    if (val === value) return;

    // Update state value
    if (!val) {
      params.delete(paramName);
    } else {
      params.set(paramName, val);
    }

    // Update page
    const url = new URL(location);
    url.hash = params.toString();
    setLocation(url, true);
  };

  return [value, setValue] as const;
}
