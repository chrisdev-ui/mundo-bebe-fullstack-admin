import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import { getXataClient } from './xata'

const xata = getXataClient()
const client = new Client({ connectionString: xata.sql.connectionString })
const db = drizzle(client)

export default db
