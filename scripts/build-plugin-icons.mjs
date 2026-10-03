/**
 * Produces the square PNGs the OpenAI Plugins portal requires for a listing's
 * logo and composer icon.
 *
 * The dashboard favicon is 1374x1145 — not square, so validation rejects it.
 * We letterbox it onto a square canvas rather than cropping, so nothing in the
 * artwork is cut off, and emit both a full-colour and a dark-mode variant.
 *
 * Run: node scripts/build-plugin-icons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')

const SRC = path.join(root, 'apps/web/public/favicon.png')
const OUT_DIR = path.join(root, 'plugin/assets')

// Spec: square, at least 48x48, PNG/JPEG/WebP/SVG, at most 5 MiB, raster
// dimensions at most 4096.
const SIZE = 512
const PADDING = 0.04 // fraction of the canvas left as breathing room

fs.mkdirSync(OUT_DIR, { recursive: true })

const src = sharp(SRC)
const meta = await src.metadata()

if (!meta.width || !meta.height) {
  throw new Error('could not read source image dimensions')
}

// Fit the source inside the padded square, then centre it on a white plate.
// The favicon artwork is dark-on-transparent, so a white plate keeps it legible
// in both light and dark surfaces.
const inner = Math.round(SIZE * (1 - PADDING * 2))
const scaled = await sharp(SRC)
  .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

const plate = {
  create: {
    width: SIZE,
    height: SIZE,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
}

const targets = [
  { file: 'logo.png', dark: false },
  { file: 'logo-dark.png', dark: true },
  { file: 'composer-icon.png', dark: false },
  { file: 'composer-icon-dark.png', dark: true },
]

for (const { file, dark } of targets) {
  const background = dark
    ? { r: 33, g: 33, b: 33, alpha: 1 }
    : { r: 255, g: 255, b: 255, alpha: 1 }

  const composited = await sharp(plate)
    .composite([{ input: scaled, gravity: 'center' }])
    .flatten({ background })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const dest = path.join(OUT_DIR, file)
  fs.writeFileSync(dest, composited)
  const out = await sharp(dest).metadata()
  console.log(
    `${file.padEnd(24)} ${out.width}x${out.height}  ${(composited.length / 1024).toFixed(0)} KB`,
  )
}

console.log(`\nsource: ${meta.width}x${meta.height} → ${SIZE}x${SIZE} (letterboxed)`)