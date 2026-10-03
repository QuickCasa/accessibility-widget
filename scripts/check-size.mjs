import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

/**
 * Being small is part of the promise. This runs in CI after every build and
 * fails the job when the bundle outgrows its budget, so growth is always a
 * deliberate decision made in a pull request rather than a slow drift.
 */
const BUNDLE_PATH = 'dist/accessibility.js'
const RAW_BUDGET_IN_BYTES = 22 * 1024
const GZIP_BUDGET_IN_BYTES = 7.5 * 1024

const formatKilobytes = bytes => `${(bytes / 1024).toFixed(2)} KB`

const bundle = readFileSync(BUNDLE_PATH)
const rawSize = bundle.length
const gzipSize = gzipSync(bundle, { level: 9 }).length

console.log(
  `${BUNDLE_PATH}: ${formatKilobytes(rawSize)} raw (budget ${formatKilobytes(RAW_BUDGET_IN_BYTES)}), ` +
    `${formatKilobytes(gzipSize)} gzipped (budget ${formatKilobytes(GZIP_BUDGET_IN_BYTES)})`,
)

const failures = []

if (rawSize > RAW_BUDGET_IN_BYTES) {
  failures.push('raw size is over budget')
}

if (gzipSize > GZIP_BUDGET_IN_BYTES) {
  failures.push('gzipped size is over budget')
}

if (failures.length > 0) {
  console.error(`Size check failed: ${failures.join(' and ')}.`)
  process.exit(1)
}

console.log('Size check passed.')
