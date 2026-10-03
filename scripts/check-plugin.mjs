/**
 * Validates plugin/ against the OpenAI Plugins submission rules we can check
 * locally: required fields, character limits, referenced files, and the exact
 * positive/negative test-case counts.
 *
 * Run: node scripts/check-plugin.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'plugin')
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'plugin.json'), 'utf8'))

const problems = []
const ok = []

function check(label, condition, detail = '') {
  if (condition) ok.push(label)
  else problems.push(detail ? `${label} — ${detail}` : label)
}

const ext = manifest.extensions?.['com.openai'] ?? {}
const ui = ext.interface ?? {}
const review = ext.review ?? {}
const cases = review.test_cases ?? {}

check('root name', !!manifest.name)
check('root version', !!manifest.version)
check('root description', !!manifest.description)
check('author.name', !!manifest.author?.name)
check('license', !!manifest.license)
check('repository', !!manifest.repository)

check('interface.displayName', !!ui.displayName)
check(
  'interface.shortDescription ≤ 30',
  (ui.shortDescription?.length ?? 0) <= 30,
  `${ui.shortDescription?.length} chars`,
)
check('interface.longDescription ≤ 4000', (ui.longDescription?.length ?? 0) <= 4000)
check('interface.developerName', !!ui.developerName)
check('interface.category', !!ui.category)
check('capabilities ≤ 20', (ui.capabilities?.length ?? 0) <= 20)
check('defaultPrompt ≤ 3', (ui.defaultPrompt?.length ?? 0) <= 3)

for (const field of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
  const v = ui[field]
  check(`interface.${field}`, !!v && v.startsWith('https://'), v || 'missing or not https')
}

check('positive test cases === 5', cases.positive?.length === 5, `got ${cases.positive?.length ?? 0}`)
check('negative test cases === 3', cases.negative?.length === 3, `got ${cases.negative?.length ?? 0}`)

for (const [i, c] of (cases.positive ?? []).entries()) {
  check(`positive[${i}].prompt`, !!c.prompt)
  check(`positive[${i}].tools_triggered`, !!c.tools_triggered)
  check(`positive[${i}].expected_behavior`, !!c.expected_behavior)
}
for (const [i, c] of (cases.negative ?? []).entries()) {
  check(`negative[${i}].prompt`, !!c.prompt)
}

check('review.demo_recording_url', !!review.demo_recording_url)
check('publication.countries', Array.isArray(ext.publication?.countries))
check('publication.release_notes', !!ext.publication?.release_notes)

// Referenced files must exist in the package.
const refs = [ui.logo, ui.logoDark, ui.composerIcon, ui.composerIconDark, ext.onboardingSkill]
for (const r of refs.filter(Boolean)) {
  check(`file ${r}`, fs.existsSync(path.join(dir, r.replace(/^\.\//, ''))))
}
check('file mcp.json', fs.existsSync(path.join(dir, 'mcp.json')))

const mcp = JSON.parse(fs.readFileSync(path.join(dir, 'mcp.json'), 'utf8'))
const servers = Object.values(mcp.mcpServers ?? {})
check('exactly one MCP server', servers.length === 1, `got ${servers.length}`)
check('mcp server type streamable-http', servers[0]?.type === 'streamable-http')
check('mcp server url is https', String(servers[0]?.url ?? '').startsWith('https://'))

// Icons must be square PNGs within the size limits.
for (const icon of [ui.logo, ui.composerIcon].filter(Boolean)) {
  const file = path.join(dir, icon.replace(/^\.\//, ''))
  if (!fs.existsSync(file)) continue
  const buf = fs.readFileSync(file)
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  check(`${icon} is square`, width === height, `${width}x${height}`)
  check(`${icon} ≥ 48px`, width >= 48, `${width}px`)
  check(`${icon} ≤ 5 MiB`, buf.length <= 5 * 1024 * 1024)
}

// No credentials in the package.
const raw = fs.readFileSync(path.join(dir, 'plugin.json'), 'utf8')
for (const banned of ['test_credentials', 'reviewer_instructions', 'password', 'secret']) {
  check(`no "${banned}" in manifest`, !raw.toLowerCase().includes(banned))
}

// Final directory submission uses stricter limits than package validation.
const finalLimit = (value, max, label) =>
  check(label, value <= max, `${value} > ${max}`)

finalLimit(manifest.description.length, 1024, 'description ≤1024 (final)')
finalLimit(ui.displayName.length, 30, 'displayName ≤30 (final)')
finalLimit(ui.shortDescription.length, 30, 'shortDescription ≤30 (final)')
finalLimit(ui.longDescription.length, 4000, 'longDescription ≤4000 (final)')
finalLimit(ui.developerName.length, 80, 'developerName ≤80 (final)')
for (const [i, c] of (ui.capabilities ?? []).entries()) {
  finalLimit(c.length, 120, `capabilities[${i}] ≤120 (final)`)
}
for (const [i, p] of (ui.defaultPrompt ?? []).entries()) {
  finalLimit(p.length, 128, `defaultPrompt[${i}] ≤128 (final)`)
}

const CATEGORIES = [
  'Productivity', 'Creativity', 'Developer Tools', 'Business & Operations',
  'Data & Analytics', 'Communication', 'Education & Research', 'Security',
  'Finance', 'Healthcare', 'Travel', 'Entertainment', 'Other',
]
check('category is supported', CATEGORIES.includes(ui.category), ui.category)

console.log(`\npassed: ${ok.length}`)
if (problems.length) {
  console.log(`FAILED: ${problems.length}\n`)
  for (const p of problems) console.log('  ✗ ' + p)
  process.exit(1)
}
console.log('plugin/ is ready to zip\n')