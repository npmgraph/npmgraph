import useLocation from './useLocation.js';

export default function useSearchParam<T extends string>(
  searchProp: string,
): readonly [val: T, set: (val: T) => void] {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.search);
  const value = (params.get(searchProp) ?? '') as T;

  const setValue = (val: T) => {
    // Update state value
    if (!val) {
      params.delete(searchProp);
    } else {
      params.set(searchProp, val);
    }

    // Update page
    const url = new URL(location);
    url.search = params.toString();
    setLocation(url, true);
  };

  return [value, setValue] as const;
}
