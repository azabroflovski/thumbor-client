import { Thumbor } from './thumbor.ts'
import type { ThumborClientOptions } from './types.ts'

/**
 * Factory function to create a Thumbor instance with given options.
 * @param options Options for configuring the Thumbor instance.
 * @returns A new instance of Thumbor.
 */
export function createThumbor(options: ThumborClientOptions) {
  return new Thumbor(options)
}
