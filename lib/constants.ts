export const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';

export const COLORIZE_BUS = 'bus';
export const COLORIZE_COLORS = [
  'var(--bg-red)',
  'var(--bg-orange)',
  'var(--bg-yellow)',
  'var(--bg-green)',
];

export const PARAM_COLLAPSE = 'collapse';
export const PARAM_COLORIZE = 'color';
export const PARAM_DEPENDENCIES = 'deps';
export const PARAM_HIDE = 'hide';
export const PARAM_PACKAGES = 'packages';
export const PARAM_QUERY = 'q';
export const PARAM_REGISTRY = 'registry';
export const PARAM_SELECTION = 'select';
export const PARAM_SIZING = 'sizing';
export const PARAM_ZOOM = 'zoom';

export const SEARCH_FIELD_ID = 'search-field';
export const UNNAMED_PACKAGE = 'unnamed module';
export const UNNAMED_PACKAGE_PREFIX = 'unnamed-package-';

export const ZOOM_FIT_HEIGHT = 'h';
export const ZOOM_FIT_WIDTH = 'w';
export const ZOOM_NONE = null;

export const PaneType = {
  MODULE: 'module',
  REPORT: 'report',
  GRAPH: 'graph',
  INFO: 'info',
  SETTINGS: 'settings',
} as const;

export type PaneTypes = (typeof PaneType)[keyof typeof PaneType];
