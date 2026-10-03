/**
 * GENERATED FILE — do not edit by hand.
 * Source: @better-auth/oauth-provider model definitions.
 * Regenerate with: node scripts/generate-oauth-schema.mjs
 *
 * OAuth 2.1 provider tables backing the ChatGPT plugin's authorize/token flow.
 */
import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import * as sharedSchema from '@repo/db/schema'

export const oauthResource = pgTable('oauthResource', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull().unique(),
  name: text('name').notNull(),
  accessTokenTtl: integer('accessTokenTtl'),
  refreshTokenTtl: integer('refreshTokenTtl'),
  signingAlgorithm: text('signingAlgorithm'),
  signingKeyId: text('signingKeyId'),
  allowedScopes: jsonb('allowedScopes').$type<string[]>(),
  customClaims: jsonb('customClaims'),
  dpopBoundAccessTokensRequired: boolean('dpopBoundAccessTokensRequired').default(false),
  disabled: boolean('disabled').default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }),
  updatedAt: timestamp('updatedAt', { withTimezone: true }),
  policyVersion: integer('policyVersion').default(1),
  metadata: jsonb('metadata'),
})

export const oauthClient = pgTable('oauthClient', {
  id: text('id').primaryKey(),
  clientId: text('clientId').notNull().unique(),
  clientSecret: text('clientSecret'),
  clientDiscoveryId: text('clientDiscoveryId'),
  disabled: boolean('disabled').default(false),
  skipConsent: boolean('skipConsent'),
  enableEndSession: boolean('enableEndSession'),
  subjectType: text('subjectType'),
  scopes: jsonb('scopes').$type<string[]>(),
  clientCredentialsScopes: jsonb('clientCredentialsScopes').$type<string[]>().default(sql`'[]'::jsonb`),
  userId: text('userId').references(() => sharedSchema.user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }),
  updatedAt: timestamp('updatedAt', { withTimezone: true }),
  name: text('name'),
  uri: text('uri'),
  icon: text('icon'),
  contacts: jsonb('contacts').$type<string[]>(),
  tos: text('tos'),
  policy: text('policy'),
  softwareId: text('softwareId'),
  softwareVersion: text('softwareVersion'),
  softwareStatement: text('softwareStatement'),
  redirectUris: jsonb('redirectUris').$type<string[]>().notNull(),
  postLogoutRedirectUris: jsonb('postLogoutRedirectUris').$type<string[]>(),
  backchannelLogoutUri: text('backchannelLogoutUri'),
  backchannelLogoutSessionRequired: boolean('backchannelLogoutSessionRequired'),
  tokenEndpointAuthMethod: text('tokenEndpointAuthMethod'),
  applicationType: text('applicationType'),
  jwks: text('jwks'),
  jwksUri: text('jwksUri'),
  grantTypes: jsonb('grantTypes').$type<string[]>(),
  responseTypes: jsonb('responseTypes').$type<string[]>(),
  requirePKCE: boolean('requirePKCE'),
  dpopBoundAccessTokens: boolean('dpopBoundAccessTokens').default(false),
  referenceId: text('referenceId'),
  metadata: jsonb('metadata'),
})

export const oauthAccessToken = pgTable('oauthAccessToken', {
  id: text('id').primaryKey(),
  token: text('token').unique(),
  clientId: text('clientId').notNull().references(() => oauthClient.clientId, { onDelete: 'cascade' }),
  sessionId: text('sessionId').references(() => sharedSchema.session.id, { onDelete: 'set null' }),
  userId: text('userId').references(() => sharedSchema.user.id, { onDelete: 'cascade' }),
  referenceId: text('referenceId'),
  authorizationCodeId: text('authorizationCodeId'),
  resources: jsonb('resources').$type<string[]>(),
  requestedUserInfoClaims: jsonb('requestedUserInfoClaims').$type<string[]>(),
  refreshId: text('refreshId').references(() => oauthRefreshToken.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }),
  revoked: timestamp('revoked', { withTimezone: true }),
  confirmation: jsonb('confirmation'),
  scopes: jsonb('scopes').$type<string[]>().notNull(),
})

export const oauthRefreshToken = pgTable('oauthRefreshToken', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  clientId: text('clientId').notNull().references(() => oauthClient.clientId, { onDelete: 'cascade' }),
  sessionId: text('sessionId').references(() => sharedSchema.session.id, { onDelete: 'set null' }),
  userId: text('userId').notNull().references(() => sharedSchema.user.id, { onDelete: 'cascade' }),
  referenceId: text('referenceId'),
  authorizationCodeId: text('authorizationCodeId'),
  resources: jsonb('resources').$type<string[]>(),
  requestedUserInfoClaims: jsonb('requestedUserInfoClaims').$type<string[]>(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }),
  revoked: timestamp('revoked', { withTimezone: true }),
  rotatedAt: timestamp('rotatedAt', { withTimezone: true }),
  rotationReplayResponse: text('rotationReplayResponse'),
  rotationReplayExpiresAt: timestamp('rotationReplayExpiresAt', { withTimezone: true }),
  authTime: timestamp('authTime', { withTimezone: true }),
  confirmation: jsonb('confirmation'),
  scopes: jsonb('scopes').$type<string[]>().notNull(),
})

export const oauthConsent = pgTable('oauthConsent', {
  id: text('id').primaryKey(),
  clientId: text('clientId').notNull().references(() => oauthClient.clientId, { onDelete: 'cascade' }),
  userId: text('userId').references(() => sharedSchema.user.id, { onDelete: 'cascade' }),
  referenceId: text('referenceId'),
  resources: jsonb('resources').$type<string[]>(),
  requestedUserInfoClaims: jsonb('requestedUserInfoClaims').$type<string[]>(),
  scopes: jsonb('scopes').$type<string[]>().notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }),
  updatedAt: timestamp('updatedAt', { withTimezone: true }),
})

export const oauthClientAssertion = pgTable('oauthClientAssertion', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
})

export const oauthClientResource = pgTable('oauthClientResource', {
  id: text('id').primaryKey(),
  clientId: text('clientId').notNull().references(() => oauthClient.clientId, { onDelete: 'cascade' }),
  resourceId: text('resourceId').notNull().references(() => oauthResource.identifier, { onDelete: 'cascade' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt', { withTimezone: true }),
})

export const jwks = pgTable('jwks', {
  id: text('id').primaryKey(),
  publicKey: text('publicKey').notNull(),
  privateKey: text('privateKey').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }),
  alg: text('alg'),
  crv: text('crv'),
})
