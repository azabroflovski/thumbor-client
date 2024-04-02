import { FitInType, HorizontalPosition, VerticalPosition } from './enums.ts'

export interface ThumborClientOptions {
    url: string;
    key?: string
}

export interface WindowSizeAndPosition {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface Parameters {
    imagePath: string;
    width: number | 'orig';
    height: number | 'orig';
    smart: boolean;
    trimFlag: boolean;
    fitInType?: FitInType;
    withFlipHorizontally: boolean;
    withFlipVertically: boolean;
    halignValue?: HorizontalPosition;
    valignValue?: VerticalPosition;
    cropValues?: WindowSizeAndPosition;
    filtersCalls: string[];
}
