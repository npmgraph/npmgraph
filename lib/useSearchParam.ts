import useLocation from './useLocation.js';

export default function useSearchParam<T extends string>(paramName: string) {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.search);
  const value = (params.get(paramName) ?? '') as T;

  const setValue = (val: T, replace = false) => {
    if (val === value) return;

    // Update state value
    if (!val) {
      params.delete(paramName);
    } else {
      params.set(paramName, val);
    }

    // Update page
    const url = new URL(location);
    url.search = params.toString();

    setLocation(url, replace);
  };

  return [value, setValue] as const;
}
