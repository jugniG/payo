/**
 * OAuth 2.1 authorization server for the Payo MCP server.
 *
 * Why this lives in apps/mcp rather than apps/web: the MCP resource server and
 * its authorization server must agree on `issuer` and `resource`. Running the
 * `mcp()` plugin here keeps both on one origin, which is what ChatGPT's OAuth
 * flow expects. Both apps share the same user/session tables via @repo/db and
 * the same BETTER_AUTH_SECRET, so a session created on the web dashboard is
 * visible here.
 *
 * The MCP tool surface still accepts API keys and session cookies — those paths
 * are untouched and keep working. OAuth is additive.
 */
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { promises as dns } from 'node:dns'
import { magicLink } from 'better-auth/plugins'
import { jwt } from 'better-auth/plugins'
import { mcp } from '@better-auth/mcp'
import { cimd } from '@better-auth/cimd'
import {
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from '@better-auth/oauth-provider'
import { db } from '@repo/db'
import * as schema from '@repo/db/schema'
import * as oauthSchema from './oauth-schema.js'
import { env, MCP_RESOURCE } from './env.js'

/**
 * Registering the MCP routes under this prefix keeps the OAuth discovery
 * documents under /.well-known/oauth-authorization-server (the default) while
 * leaving /api/auth/* free for the credential endpoints. `@better-auth/mcp`
 * serves RFC 9728 protected-resource metadata from its own base URL, so the
 * caller must mount these handlers on the same host as /mcp.
 */
export const auth = betterAuth({
  baseURL: env.PAYO_MCP_PUBLIC_ORIGIN,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      ...oauthSchema,
    },
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    jwt(),
    mcp({
      // Tokens are bound to this exact identifier; it is also what we advertise
      // in protected-resource metadata.
      resource: MCP_RESOURCE,
      // ChatGPT redirects here when the user has no Payo session yet.
      loginPage: `${env.BETTER_AUTH_URL}/login`,
      consentPage: `${env.BETTER_AUTH_URL}/settings/connect`,
      allowDynamicClientRegistration: true,
    }),
    cimd({
      // MCP 2026-07-28 pins Client ID Metadata Documents draft-00. Without this
      // ChatGPT's client registration handshake fails discovery.
      metadataProfile: 'mcp-2026-07-28',
      // ChatGPT identifies itself with a client_id that is a public HTTPS URL.
      // We fetch that document ourselves, so we must block loopback/private/link-local
      // targets or this becomes an SSRF pivot into our own network.
      fetchClientMetadataResource: safeFetchMetadataResource,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { Resend } = await import('resend')
        const resend = new Resend(env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'auth@chatcash.live',
          to: email,
          subject: 'Your Payo login link',
          html: `<p>Click below to sign in to Payo:</p><a href="${url}">${url}</a>`,
        })
      },
    }),
  ],
})

/**
 * Fetch a client metadata document, refusing targets inside our own network.
 *
 * The `client_id` ChatGPT sends is attacker-influenced, so this is the SSRF
 * boundary. Better Auth cannot enforce special-use-address pinning for us — that
 * has to happen before the connection is made, which is why we do it here.
 */
async function safeFetchMetadataResource(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input : input.url)

  if (url.protocol !== 'https:') {
    throw new Error(`cimd: metadata document must be https, got ${url.protocol}`)
  }

  // Resolve first, then check every address the host maps to. A DNS name that
  // returns a private address is exactly the case we need to stop.
  const addrs = await dns.lookup(url.hostname, { all: true })

  function isPublicAddress(ip: string): boolean {
    if (ip === '::1' || ip === '0.0.0.0' || ip === '::') return false
    if (ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) return false
    if (ip.startsWith('169.254.') || ip.startsWith('fc') || ip.startsWith('fd')) return false
    // IPv4-mapped IPv6 — unwrap and re-check the v4 form.
    if (ip.startsWith('::ffff:')) return isPublicAddress(ip.slice(7))
    return true
  }

  if (addrs.length === 0 || !addrs.every((a) => isPublicAddress(a.address))) {
    throw new Error(`cimd: refusing metadata document from non-public address (${url.hostname})`)
  }

  return fetch(url, init)
}

/**
 * Google social login through the MCP host, so the OAuth authorize endpoint can
 * complete without bouncing to apps/web.
 */
export async function ensureMcpAuthRoutes(app: any) {
  const handler = auth.handler

  /**
   * Credential + protocol endpoints forwarded to better-auth. The plugin only
   * mounts these itself when it owns the HTTP server; under Express we forward
   * them by hand.
   */
  const FORWARDED = [
    '/api/auth/*',
    '/.well-known/jwks.json',
    '/jwks',
  ]

  for (const pattern of FORWARDED) {
    app.all(pattern, async (req: any, res: any, next: any) => {
      try {
        const url = `${env.PAYO_MCP_PUBLIC_ORIGIN}${req.originalUrl}`
        const body =
          req.method === 'GET' || req.method === 'HEAD'
            ? undefined
            : JSON.stringify(req.body ?? {})
        const webReq = new Request(url, {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body,
        })
        const result = await handler(webReq)
        res.status(result.status)
        result.headers.forEach((value: string, key: string) => res.appendHeader(key, value))
        res.send(await result.text())
      } catch (err) {
        next(err)
      }
    })
  }

  /**
   * Discovery documents. The plugin ships these as exportable handlers rather
   * than registering them, so mounting them is our job. ChatGPT fetches them
   * before it will attempt an authorization — if these 404, the whole OAuth
   * flow silently fails to start.
   */
  const discovery: Array<[string, (req: Request) => Promise<Response>]> = [
    ['/.well-known/oauth-authorization-server', oauthProviderAuthServerMetadata(auth as any)],
    ['/.well-known/openid-configuration', oauthProviderOpenIdConfigMetadata(auth as any)],
  ]

  for (const [path, fn] of discovery) {
    app.get(path, async (req: any, res: any, next: any) => {
      try {
        const webReq = new Request(`${env.PAYO_MCP_PUBLIC_ORIGIN}${req.originalUrl}`, {
          method: 'GET',
          headers: req.headers as Record<string, string>,
        })
        const result = await fn(webReq)
        res.status(result.status)
        result.headers.forEach((value: string, key: string) => res.appendHeader(key, value))
        res.send(await result.text())
      } catch (err) {
        next(err)
      }
    })
  }
}