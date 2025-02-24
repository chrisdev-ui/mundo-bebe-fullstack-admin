import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "USER",
  "GUEST",
  "ADMIN",
  "SUPER_ADMIN",
]);

export const invitation = pgTable(
  "invitation",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    used: boolean().default(false).notNull(),
  },
  (table) => {
    return {
      invitationTokenUnique: unique("invitation_token_unique").on(table.token),
    };
  },
);

export const session = pgTable(
  "session",
  {
    sessionToken: text().primaryKey().notNull(),
    userId: uuid().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
  },
  (table) => {
    return {
      sessionUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "session_userId_user_id_fk",
      }).onDelete("cascade"),
    };
  },
);

export const user = pgTable(
  "user",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
    lastName: text("last_name"),
    username: text(),
    password: text(),
    email: text(),
    emailVerified: timestamp({ mode: "string" }),
    role: userRole().default("USER").notNull(),
    image: text(),
    phoneNumber: text("phone_number"),
    dob: timestamp({ mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      emailUniqueIdx: uniqueIndex("email_unique_index").using(
        "btree",
        sql`lower(email)`,
      ),
      userEmailUnique: unique("user_email_unique").on(table.email),
    };
  },
);

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
  },
  (table) => {
    return {
      verificationTokenIdentifierTokenPk: primaryKey({
        columns: [table.identifier, table.token],
        name: "verificationToken_identifier_token_pk",
      }),
    };
  },
);

export const authenticator = pgTable(
  "authenticator",
  {
    credentialId: text().notNull(),
    userId: uuid().notNull(),
    providerAccountId: text().notNull(),
    credentialPublicKey: text().notNull(),
    counter: integer().notNull(),
    credentialDeviceType: text().notNull(),
    credentialBackedUp: boolean().notNull(),
    transports: text(),
  },
  (table) => {
    return {
      authenticatorUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "authenticator_userId_user_id_fk",
      }).onDelete("cascade"),
      authenticatorUserIdCredentialIdPk: primaryKey({
        columns: [table.credentialId, table.userId],
        name: "authenticator_userId_credentialID_pk",
      }),
      authenticatorCredentialIdUnique: unique(
        "authenticator_credentialID_unique",
      ).on(table.credentialId),
    };
  },
);

export const account = pgTable(
  "account",
  {
    userId: uuid().notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text(),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => {
    return {
      accountUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "account_userId_user_id_fk",
      }).onDelete("cascade"),
      accountProviderProviderAccountIdPk: primaryKey({
        columns: [table.provider, table.providerAccountId],
        name: "account_provider_providerAccountId_pk",
      }),
    };
  },
);
