import useLocation, { patchHash } from './useLocation.ts';

// All the hash parameters, and the way to change them
export function useHashParameters() {
  const [url] = useLocation();

  return [new URLSearchParams(url.hash.slice(1)), patchHash] as const;
}

export default function useHashParameter(parameterName: string) {
  const [parameters] = useHashParameters();
  const parameter = parameters.get(parameterName);

  const setValue = (
    value: string | boolean | number | null | undefined,
    shouldReplace = true,
  ) => {
    if (value === parameter) {
      return;
    }

    if (typeof value === 'number') {
      value = String(value);
    }

    patchHash(next => {
      if (!value) {
        next.delete(parameterName);
      } else if (value === true) {
        next.set(parameterName, '');
      } else {
        next.set(parameterName, value);
      }
    }, shouldReplace);
  };

  return [parameter, setValue] as const;
}
