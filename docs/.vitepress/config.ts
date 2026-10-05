import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'thumbor-client',
  description: 'Thumbor URL builder for Node, Bun, Deno, edge runtimes and browsers',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: 'https://thumbor-js.broflovski.dev' },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api' },
      // separate vite app, built into dist/playground (see package.json docs:build)
      { text: 'Playground', link: '/playground/', target: '_self' },
      { text: 'Changelog', link: 'https://github.com/azabroflovski/thumbor-client/blob/master/CHANGELOG.md' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Image source', link: '/guide/image-source' },
          { text: 'Resize and crop', link: '/guide/resize-and-crop' },
          { text: 'Filters', link: '/guide/filters' },
          { text: 'Meta and debug', link: '/guide/meta-and-debug' },
          { text: 'Browser and SSR', link: '/guide/browser-and-ssr' },
          { text: 'Security key', link: '/guide/security-key' },
          { text: 'Migrating from buildURL()', link: '/guide/migration' }
        ]
      },
      { text: 'API reference', link: '/api' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/azabroflovski/thumbor-client' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/thumbor-client' }
    ],

    editLink: {
      pattern: 'https://github.com/azabroflovski/thumbor-client/edit/master/docs/:path'
    },

    search: { provider: 'local' },

    footer: {
      message: 'MIT License'
    }
  }
})
