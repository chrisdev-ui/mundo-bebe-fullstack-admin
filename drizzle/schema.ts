import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid
} from 'drizzle-orm/pg-core'

export const session = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey().notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'string' }).notNull()
})

export const user = pgTable(
  'user',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('name'),
    last_name: text('last_name'),
    username: text('username').notNull(),
    password: text('password').notNull(),
    email: text('email').notNull(),
    email_verified: timestamp('email_verified', { mode: 'string' }),
    image: text('image'),
    role: text('role').default('USER').notNull(),
    phone_number: text('phone_number'),
    dob: timestamp('dob', { mode: 'string' }),
    created_at: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull()
  },
  (table) => {
    return {
      user_email_unique: unique('user_email_unique').on(table.email)
    }
  }
)

export const verificationToken = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'string' }).notNull()
  },
  (table) => {
    return {
      verificationToken_identifier_token_pk: primaryKey({
        columns: [table.identifier, table.token],
        name: 'verificationToken_identifier_token_pk'
      })
    }
  }
)

export const authenticator = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports')
  },
  (table) => {
    return {
      authenticator_userId_credentialID_pk: primaryKey({
        columns: [table.credentialID, table.userId],
        name: 'authenticator_userId_credentialID_pk'
      }),
      authenticator_credentialID_unique: unique(
        'authenticator_credentialID_unique'
      ).on(table.credentialID)
    }
  }
)

export const account = pgTable(
  'account',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  (table) => {
    return {
      account_provider_providerAccountId_pk: primaryKey({
        columns: [table.provider, table.providerAccountId],
        name: 'account_provider_providerAccountId_pk'
      })
    }
  }
)
