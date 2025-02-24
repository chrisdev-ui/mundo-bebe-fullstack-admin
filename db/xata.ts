import type { BaseClientOptions, SchemaInference } from "@xata.io/client";
import { buildClient } from "@xata.io/client";

import { env } from "@/env";

const tables = [] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type DatabaseSchema = {};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL: env.XATA_DATABASE_URL,
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient({
    databaseURL: env.XATA_DATABASE_URL,
    apiKey: env.XATA_API_KEY,
    branch: env.XATA_BRANCH,
  });
  return instance;
};
