import useLocation from './useLocation.js';

export default function useHashParam(paramName: string) {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const param = params.get(paramName);

  const setValue = (val: string | boolean | number, replace = true) => {
    if (val === param) return;

    // Update state value
    if (typeof val === 'boolean') {
      val ? params.set(paramName, '') : params.delete(paramName);
    } else if (typeof val === 'number') {
      params.set(paramName, String(val));
    } else {
      val ? params.set(paramName, String(val)) : params.delete(paramName);
    }

    // Update page
    const url = new URL(location);
    url.hash = params.toString();
    setLocation(url, replace);
  };

  return [param, setValue] as const;
}
