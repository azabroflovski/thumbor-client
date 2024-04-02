import { Thumbor } from './thumbor.ts'
import { ThumborClientOptions } from './types.ts'

export function createThumbor(options: ThumborClientOptions) {
    return new Thumbor(options)
}
