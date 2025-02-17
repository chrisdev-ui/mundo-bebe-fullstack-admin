import type { BaseClientOptions, SchemaInference } from "@xata.io/client";
import { buildClient } from "@xata.io/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.development.local", override: true });

const tables = [] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type DatabaseSchema = {};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL: process.env.XATA_DATABASE_URL,
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
    databaseURL: process.env.XATA_DATABASE_URL!,
    apiKey: process.env.XATA_API_KEY!,
    branch: process.env.XATA_BRANCH!,
  });
  return instance;
};
