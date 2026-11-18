import { PARAM_HIDE } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

// The report-only view (`#hide=graph`) shows the report as a document, without the graph
export default function useReportOnly() {
  const [hide, setHide] = useHashParam(PARAM_HIDE);
  const isReportOnly = hide === 'graph';

  const setReportOnly = (isEnabled: boolean) => {
    // Entering pushes a history entry so Back returns to the graph
    setHide(isEnabled ? 'graph' : null, !isEnabled);

    if (isEnabled && !isReportOnly) {
      history.replaceState({ ...history.state, reportOnly: true }, '');
    }
  };

  // Leave like Back would, instead of stacking a duplicate of the previous entry
  const leaveReportOnly = (afterwards?: () => void) => {
    if (history.state?.reportOnly) {
      if (afterwards) {
        globalThis.addEventListener('popstate', afterwards, { once: true });
      }

      history.back();
      return;
    }

    setHide(null);
    afterwards?.();
  };

  return [isReportOnly, setReportOnly, leaveReportOnly] as const;
}
