import useLocation from './useLocation.js';

export default function useHashParam(paramName: string) {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const param = params.get(paramName);

  const setValue = (
    val: string | boolean | number | null | undefined,
    replace = true,
  ) => {
    if (val === param) return;

    if (typeof val === 'number') val = String(val);

    if (!val) {
      params.delete(paramName);
    } else if (val === true) {
      params.set(paramName, '');
    } else {
      params.set(paramName, val);
    }

    // Update page
    const url = new URL(location);
    url.hash = params.toString();
    setLocation(url, replace);
  };

  return [param, setValue] as const;
}
