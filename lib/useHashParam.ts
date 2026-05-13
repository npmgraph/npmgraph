import { patchLocation } from './useLocation.ts';

export default function useHashParameter(parameterName: string) {
  const parameters = new URLSearchParams(location.hash.replace(/^#/v, ''));
  const parameter = parameters.get(parameterName);

  const setValue = (
    value: string | boolean | number | undefined,
    replace = true,
  ) => {
    if (value === parameter) return;

    if (typeof value === 'number') value = String(value);

    if (!value) {
      parameters.delete(parameterName);
    } else if (value === true) {
      parameters.set(parameterName, '');
    } else {
      parameters.set(parameterName, value);
    }

    // Update page
    patchLocation({ hash: parameters.toString() }, replace);
  };

  return [parameter, setValue] as const;
}
