import { PARAM_HIDE } from '../lib/constants.ts';
import useHashParameter from './useHashParameter.ts';

// The report-only view (`#hide=graph`) shows the report as a document, without the graph
export default function useReportOnly() {
  const [hide, setHide] = useHashParameter(PARAM_HIDE);

  const setReportOnly = (isEnabled: boolean) => {
    setHide(isEnabled ? 'graph' : null);
  };

  return [hide === 'graph', setReportOnly] as const;
}
