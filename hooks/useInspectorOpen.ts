import { PARAM_HIDE, PARAM_TAB, TAB_NONE } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';
import { patchLocation } from './useLocation.ts';
import useReportOnly from './useReportOnly.ts';

// `tab=none` closes the inspector. The legacy `hide` param does the same.
// The report-only view (`hide=graph`) is always open.
export function useInspectorOpen() {
  const [tab] = useHashParam(PARAM_TAB);
  const [hide] = useHashParam(PARAM_HIDE);
  const [isReportOnly] = useReportOnly();
  const isOpen = isReportOnly || (tab !== TAB_NONE && hide === null);

  const setOpen = (isEnabled: boolean) => {
    const parameters = new URLSearchParams(location.hash.slice(1));
    parameters.delete(PARAM_HIDE);
    if (!isEnabled) {
      parameters.set(PARAM_TAB, TAB_NONE);
    } else if (parameters.get(PARAM_TAB) === TAB_NONE) {
      parameters.delete(PARAM_TAB);
    }

    patchLocation({ hash: parameters.toString() }, true);
  };

  return [isOpen, setOpen] as const;
}
