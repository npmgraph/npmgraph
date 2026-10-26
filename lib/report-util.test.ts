import { describe, expect, it } from 'vitest';
import { getReportPath, parseReportPath } from './report-util.ts';

describe('getReportPath', () => {
  it('links to a module', () => {
    expect(getReportPath(['send'])).toBe('/report/send');
    expect(getReportPath(['send@0.19.0'])).toBe('/report/send@0.19.0');
  });

  it('keeps scoped names readable', () => {
    expect(getReportPath(['@babel/core@7'])).toBe('/report/@babel/core@7');
  });

  it('joins multiple modules', () => {
    expect(getReportPath(['send', 'express@^4'])).toBe(
      '/report/send,express@%5E4',
    );
  });
});

describe('parseReportPath', () => {
  it('ignores other paths', () => {
    expect(parseReportPath('/')).toBeUndefined();
    expect(parseReportPath('/report')).toBeUndefined();
    expect(parseReportPath('/report/')).toBeUndefined();
    expect(parseReportPath('/reports/send')).toBeUndefined();
  });

  it('reads modules', () => {
    expect(parseReportPath('/report/send')).toEqual(['send']);
    expect(parseReportPath('/report/send/')).toEqual(['send']);
    expect(parseReportPath('/report/@babel/core@7')).toEqual(['@babel/core@7']);
    expect(parseReportPath('/report/%40babel%2Fcore')).toEqual(['@babel/core']);
    expect(parseReportPath('/report/send,express@%5E4')).toEqual([
      'send',
      'express@^4',
    ]);
  });

  it('survives malformed escapes', () => {
    expect(parseReportPath('/report/100%')).toEqual(['100%']);
  });

  it('round-trips', () => {
    const query = ['@babel/core@^7.1', 'send'];
    expect(parseReportPath(getReportPath(query))).toEqual(query);
  });
});
