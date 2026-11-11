import { useQueryState } from 'nuqs';
import { PARAM_HIDE } from '../lib/constants.ts';

// The report-only view (`#hide=graph`) shows the report as a document, without the graph
export default function useReportOnly() {
  const [hide, setHide] = useQueryState(PARAM_HIDE);

  const setReportOnly = (isEnabled: boolean) => {
    void setHide(isEnabled ? 'graph' : null);
  };

  return [hide === 'graph', setReportOnly] as const;
}
