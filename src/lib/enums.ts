/**
 * Fit-in mode.
 */
export enum FitInType {
  /** `fit-in` */
  DEFAULT = 'DEFAULT',
  /** `full-fit-in` */
  FULL = 'FULL',
  /** `adaptive-fit-in` */
  ADAPTIVE = 'ADAPTIVE',
  /** `adaptive-full-fit-in` */
  ADAPTIVE_FULL = 'ADAPTIVE_FULL'
}

/**
 * Vertical alignment for cropping.
 */
export enum VerticalPosition {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom'
}

/**
 * Horizontal alignment for cropping.
 */
export enum HorizontalPosition {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}
