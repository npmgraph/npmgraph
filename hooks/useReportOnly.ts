import { PARAM_HIDE } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

// The report-only view (`#hide=graph`) shows the report as a document, without the graph
export default function useReportOnly() {
  const [hide, setHide] = useHashParam(PARAM_HIDE);

  const setReportOnly = (isEnabled: boolean) => {
    // Entering pushes a history entry so Back returns to the graph
    setHide(isEnabled ? 'graph' : null, !isEnabled);
  };

  return [hide === 'graph', setReportOnly] as const;
}
