import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { 'thumbor-client': 'src/main.ts' },
    format: ['esm', 'cjs'],
    platform: 'neutral',
    target: 'es2020',
    dts: true,
    sourcemap: true,
    copy: ['LICENSE']
  },
  {
    // single file for <script> tags and CDNs
    entry: { 'thumbor-client': 'src/main.ts' },
    format: 'iife',
    globalName: 'ThumborClient',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    sourcemap: true
  }
])
