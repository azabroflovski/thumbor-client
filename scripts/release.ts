// Usage: bun run release <version>
// Runs checks, moves [Unreleased] in CHANGELOG.md to the new version, bumps package.json, commits and tags.
// Then: git push --follow-tags && npm publish
// The tag push creates the GitHub release (.github/workflows/release.yml).
import { $ } from 'bun'

const version = process.argv[2]
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? '')) {
  console.error('usage: bun run release <version>, e.g. 0.2.1')
  process.exit(1)
}

if ((await $`git status --porcelain`.text()).trim()) {
  console.error('working tree is not clean')
  process.exit(1)
}

if ((await $`git branch --show-current`.text()).trim() !== 'master') {
  console.error('release from master')
  process.exit(1)
}

await $`bun run typecheck`
await $`bun run test`
await $`bun run build`
await $`bun run test:smoke`

const repo = 'https://github.com/azabroflovski/thumbor-client'
const date = new Date().toISOString().slice(0, 10)
let changelog = await Bun.file('CHANGELOG.md').text()

const unreleased = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[)/)
if (!unreleased || !unreleased[1].trim()) {
  console.error('nothing under [Unreleased] in CHANGELOG.md')
  process.exit(1)
}

const previous = changelog.match(/\n## \[(\d[^\]]*)\]/)?.[1]
changelog = changelog
  .replace('## [Unreleased]\n', `## [Unreleased]\n\n## [${version}] - ${date}\n`)
  .replace(/\[Unreleased\]: .*\n/, `[Unreleased]: ${repo}/compare/v${version}...HEAD\n[${version}]: ${repo}/compare/v${previous}...v${version}\n`)
await Bun.write('CHANGELOG.md', changelog)

const pkg = await Bun.file('package.json').json()
pkg.version = version
await Bun.write('package.json', JSON.stringify(pkg, null, 2) + '\n')

await $`git add CHANGELOG.md package.json`
await $`git commit -m ${'chore(release): v' + version}`
await $`git tag ${'v' + version}`
console.log(`v${version} tagged. Next: git push --follow-tags && npm publish`)
