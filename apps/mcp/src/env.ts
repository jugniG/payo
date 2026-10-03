import { config } from 'dotenv'
config()
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  SOLARI_API_KEY: z.string().min(1),
  SOLARI_PROFILE_ID: z.string().min(1),
  PLATFORM_CARD_NUMBER: z.string().min(1),
  PLATFORM_CARD_EXPIRY: z.string().min(1),
  PLATFORM_CARD_CVV: z.string().min(1),
  QUICKCOMMERCE_API_KEY: z.string().min(1),
  ZEPTO_CARD_INSTRUMENT_CODE: z.string().min(1),

  // ── ChatGPT plugin / MCP OAuth 2.1 ──────────────────────────────────────────
  // Canonical public origin of this MCP server. Tokens are audience-bound to
  // `${PAYO_MCP_PUBLIC_ORIGIN}/mcp`, so this MUST match the URL submitted to
  // the OpenAI Plugins portal exactly.
  PAYO_MCP_PUBLIC_ORIGIN: z.string().url().default('http://localhost:4000'),
  // Must equal apps/web's BETTER_AUTH_SECRET — both apps share one user table.
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  // Set to "true" to require OAuth on /mcp. Leave "false" so API-key and cookie
  // auth keep working while the OAuth path is being verified in staging.
  MCP_REQUIRE_OAUTH: z
    .enum(['true', 'false'])
    .default('false'),
})

export const env = envSchema.parse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  SOLARI_API_KEY: process.env.SOLARI_API_KEY,
  SOLARI_PROFILE_ID:
    process.env.SOLARI_PROFILE_ID ??
    process.env.INSTAMART_PROFILE_ID ??
    process.env.FLIPKART_PROFILE_ID,
  PLATFORM_CARD_NUMBER: process.env.PLATFORM_CARD_NUMBER,
  PLATFORM_CARD_EXPIRY: process.env.PLATFORM_CARD_EXPIRY,
  PLATFORM_CARD_CVV: process.env.PLATFORM_CARD_CVV,
  QUICKCOMMERCE_API_KEY: process.env.QUICKCOMMERCE_API_KEY,
  ZEPTO_CARD_INSTRUMENT_CODE: process.env.ZEPTO_CARD_INSTRUMENT_CODE,
  PAYO_MCP_PUBLIC_ORIGIN: process.env.PAYO_MCP_PUBLIC_ORIGIN,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  MCP_REQUIRE_OAUTH: process.env.MCP_REQUIRE_OAUTH,
})

/** Canonical protected-resource identifier. Access tokens are audience-bound to this. */
export const MCP_RESOURCE = `${env.PAYO_MCP_PUBLIC_ORIGIN}/mcp`
