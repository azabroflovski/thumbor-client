import { FitInType, HorizontalPosition, VerticalPosition } from './enums.ts'

/**
 * Interface representing options for the Thumbor client.
 */
export interface ThumborClientOptions {
    /**
     * URL of the Thumbor server.
     */
    url: string;

    /**
     * Optional security key for accessing the Thumbor server.
     */
    key?: string
}

/**
 * Interface representing window size and position.
 */
export interface WindowSizeAndPosition {
    /**
     * Top position of the window.
     */
    top: number;

    /**
     * Bottom position of the window.
     */
    bottom: number;

    /**
     * Left position of the window.
     */
    left: number;

    /**
     * Right position of the window.
     */
    right: number;
}

/**
 * Interface representing parameters for image manipulation.
 */
export interface Parameters {
    /**
     * Path to the image.
     */
    imagePath: string;

    /**
     * Desired width of the image or 'orig' for original width.
     */
    width: number | 'orig';

    /**
     * Desired height of the image or 'orig' for original height.
     */
    height: number | 'orig';

    /**
     * Flag indicating whether to use smart cropping.
     */
    smart: boolean;

    /**
     * Flag indicating whether to trim the image.
     */
    trimFlag: boolean;

    /**
     * Type of fitting to use.
     */
    fitInType?: FitInType;

    /**
     * Flag indicating whether to flip the image horizontally.
     */
    withFlipHorizontally: boolean;

    /**
     * Flag indicating whether to flip the image vertically.
     */
    withFlipVertically: boolean;

    /**
     * Horizontal alignment value.
     */
    halignValue?: HorizontalPosition;

    /**
     * Vertical alignment value.
     */
    valignValue?: VerticalPosition;

    /**
     * Crop values for the image.
     */
    cropValues?: WindowSizeAndPosition;

    /**
     * Array of filter calls for image processing.
     */
    filtersCalls: string[];
}
