import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs'
import { join } from 'node:path'

/**
 * Assembles the GitHub Pages site: the demo pages plus the built bundle,
 * side by side, so every demo can load the script with a relative path and
 * behave the same locally as it does once deployed.
 *
 * The bundle is also published under its major version, such as v1/, which is
 * the URL to embed, so a breaking release never lands on a site that embedded
 * an earlier major. Pages only holds what this script builds, so the release
 * that moves to v2/ must also carry the last v1 bundle forward (see the release
 * steps in CONTRIBUTING.md), or every v1 embed starts returning a 404.
 */
const SITE_DIRECTORY = 'site'
const DEMO_DIRECTORY = 'demo'
const DIST_DIRECTORY = 'dist'
const BUNDLE_FILES = ['accessibility.js', 'accessibility.js.map']

if (!existsSync(join(DIST_DIRECTORY, BUNDLE_FILES[0]))) {
  console.error('No build found. Run "npm run build" first.')
  process.exit(1)
}

rmSync(SITE_DIRECTORY, { recursive: true, force: true })
mkdirSync(SITE_DIRECTORY)

for (const fileName of readdirSync(DEMO_DIRECTORY)) {
  copyFileSync(join(DEMO_DIRECTORY, fileName), join(SITE_DIRECTORY, fileName))
}

const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
const majorDirectory = join(SITE_DIRECTORY, `v${version.split('.')[0]}`)
mkdirSync(majorDirectory)

for (const fileName of BUNDLE_FILES) {
  copyFileSync(join(DIST_DIRECTORY, fileName), join(SITE_DIRECTORY, fileName))
  copyFileSync(join(DIST_DIRECTORY, fileName), join(majorDirectory, fileName))
}

console.log(`Site assembled in ${SITE_DIRECTORY}/`)
