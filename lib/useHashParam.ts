import { patchLocation } from './useLocation.ts';

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- Global state hook
export default function useHashParameter(parameterName: string) {
  const parameters = new URLSearchParams(location.hash.replace(/^#/v, ''));
  const parameter = parameters.get(parameterName);

  const setValue = (
    value: string | boolean | number | null | undefined,
    shouldReplace = true,
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
    patchLocation({ hash: parameters.toString() }, shouldReplace);
  };

  return [parameter, setValue] as const;
}
