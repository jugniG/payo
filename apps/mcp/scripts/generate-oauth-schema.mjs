/**
 * Generates Drizzle table definitions from the OAuth provider's model
 * definitions. The `better-auth generate` CLI can't bootstrap these on its own:
 * it refuses to emit a schema when the adapter is missing the very models it is
 * supposed to create. So we read the field specs straight out of the installed
 * plugin and render them ourselves.
 *
 * Run: node scripts/generate-oauth-schema.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')

const CANDIDATE_FILES = [
  'node_modules/@better-auth/oauth-provider/dist/authorize-K1WHCNih.mjs',
  'node_modules/@better-auth/mcp/dist/index.mjs',
  // The jwt plugin's key store. Declared in schema.mjs as a bare object
  // literal (`const schema = { jwks: { fields: {...} } }`) rather than inline
  // in the plugin body, so it needs its own source file in the search list.
  'node_modules/better-auth/dist/plugins/jwt/schema.mjs',
]

const MODELS = [
  'oauthResource',
  'oauthClient',
  'oauthAccessToken',
  'oauthRefreshToken',
  'oauthConsent',
  'oauthClientAssertion',
  'oauthClientResource',
  'jwks',
]

function objectLiteralAt(src, openIdx) {
  let depth = 0
  for (let j = openIdx; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(openIdx, j + 1) }
  }
  throw new Error("unbalanced object literal")
}

function extract() {
  const found = {}
  for (const rel of CANDIDATE_FILES) {
    const file = path.join(root, rel)
    if (!fs.existsSync(file)) continue
    const src = fs.readFileSync(file, 'utf8')
    for (const name of MODELS) {
      if (found[name]) continue
      // Two shapes appear in the bundle: `name: { modelName: "name", fields: {...} }`
      // and the inline `name: { fields: {...} }`. Match on the key either way.
      const i = src.indexOf(`${name}: {`)
      if (i < 0) continue
      const start = src.indexOf('{', i)
      const block = objectLiteralAt(src, start)
      if (!/fields:/.test(block)) continue
      found[name] = block
    }
  }
  return found
}

/**
 * The plugin block is valid JS object literal syntax except for trailing
 * commas, so we can evaluate the `fields` sub-object in isolation.
 */
function parseModel(block) {
  const fieldsOpen = block.indexOf('{', block.indexOf('fields'))
  return eval(`(${objectLiteralAt(block, fieldsOpen)})`) // eslint-disable-line no-eval
}

/** Tables that already live in @repo/db and are referenced by foreign keys. */
const EXTERNAL_REFS = { user: 'user', session: 'session' }

const COLUMN = {
  string: (name) => `text('${name}')`,
  number: (name) => `integer('${name}')`,
  boolean: (name) => `boolean('${name}')`,
  date: (name) => `timestamp('${name}', { withTimezone: true })`,
  json: (name) => `jsonb('${name}')`,
  stringArray: (name) => `jsonb('${name}').$type<string[]>()`,
}

function renderTable(model, fields) {
  const cols = []
  for (const [name, spec] of Object.entries(fields)) {
    const type = spec.type === 'string[]' ? 'stringArray' : spec.type
    const renderer = COLUMN[type]
    if (!renderer) throw new Error(`unknown column type "${spec.type}" on ${model}.${name}`)

    const parts = [renderer(name)]
    if (spec.required) parts.push('.notNull()')
    if (spec.unique) parts.push('.unique()')

    if (spec.defaultValue !== undefined) {
      const v = spec.defaultValue
      if (type === 'stringArray' || type === 'json') {
        // Drizzle can't take a bare JS array/obj as a column default; emit a
        // SQL literal instead. The plugin uses `defaultValue: []` for these.
        parts.push(`.default(sql\`'[]'::jsonb\`)`)
      } else {
        parts.push(`.default(${typeof v === 'string' ? `'${v}'` : v})`)
      }
    }

    if (spec.references) {
      const r = spec.references
      const target = EXTERNAL_REFS[r.model] ? `sharedSchema.${r.model}` : r.model
      parts.push(`.references(() => ${target}.${r.field}, { onDelete: '${r.onDelete ?? 'cascade'}' })`)
    }
    cols.push(`  ${name}: ${parts.join('')},`)
  }
  // better-auth's Drizzle adapter expects every model to carry an `id` primary
  // key (the rest of @repo/db/schema does the same). None of the OAuth models
  // declare one, but oauthAccessToken.refreshId references
  // oauthRefreshToken.id, so we add it to every table.
  const colsWithId = [`  id: text('id').primaryKey(),`, ...cols]
  return `export const ${model} = pgTable('${model}', {\n${colsWithId.join('\n')}\n})`
}

const blocks = extract()
const missing = MODELS.filter((m) => !blocks[m])
if (missing.length) {
  console.error('Could not extract:', missing.join(', '))
  process.exit(1)
}

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Source: @better-auth/oauth-provider model definitions.
 * Regenerate with: node scripts/generate-oauth-schema.mjs
 *
 * OAuth 2.1 provider tables backing the ChatGPT plugin's authorize/token flow.
 */
import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import * as sharedSchema from '@repo/db/schema'

${MODELS.map((m) => renderTable(m, parseModel(blocks[m]))).join('\n\n')}
`

const dest = path.join(root, 'src', 'oauth-schema.ts')
fs.writeFileSync(dest, out)
console.log(`Wrote ${dest}`)
console.log(`Models: ${MODELS.join(', ')}`)