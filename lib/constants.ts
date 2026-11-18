import * as colorStyles from './colors.module.css';

export const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';

// Color names to the CSS module classes that apply them
export const COLORS = {
  red: colorStyles.red,
  orange: colorStyles.orange,
  yellow: colorStyles.yellow,
  green: colorStyles.green,
  blue: colorStyles.blue,
};

export type ColorName = keyof typeof COLORS;

export const PARAM_COLLAPSE = 'collapse';
export const PARAM_COLORIZE = 'color';
export const PARAM_DEPENDENCIES = 'deps';
export const PARAM_HIDE = 'hide';
export const PARAM_PACKAGES = 'packages';
export const PARAM_QUERY = 'q';
export const PARAM_REGISTRY = 'registry';
export const PARAM_SECTION = 'section';
export const PARAM_SELECTION = 'select';
export const PARAM_SIZING = 'sizing';
export const PARAM_TAB = 'tab';

export const SEARCH_FIELD_ID = 'search-field';
export const UNNAMED_PACKAGE = 'unnamed module';
export const UNNAMED_PACKAGE_PREFIX = 'unnamed-package-';

export const PaneType = {
  MODULE: 'module',
  REPORT: 'report',
  INFO: 'info',
  VIEW: 'view',
  // Closes the inspector
  NONE: 'none',
} as const;

export type PaneTypes = (typeof PaneType)[keyof typeof PaneType];
export const TIGHT_SCREEN_QUERY = '(max-aspect-ratio: 2/3), (max-width: 700px)';
