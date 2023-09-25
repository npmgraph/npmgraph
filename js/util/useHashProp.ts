import useLocation from './useLocation.js';

export default function useHashProp<T extends string>(
  hashProp: string,
): readonly [val: T, set: (val: T) => void] {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const value = (params.get(hashProp) ?? '') as T;

  const setValue = (val: T) => {
    // Update state value
    if (!val) {
      params.delete(hashProp);
    } else {
      params.set(hashProp, val);
    }

    // Update page
    const url = new URL(location);
    url.hash = params.toString();
    setLocation(url, true);
  };

  return [value, setValue] as const;
}
