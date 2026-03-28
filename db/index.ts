import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

let _db: PostgresJsDatabase<typeof schema> | undefined;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const queryClient = postgres(connectionString);
    _db = drizzle(queryClient, { schema });
  }

  return _db;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  not,
  notInArray,
  or,
  sql,
} from 'drizzle-orm';
export * from './schema/index';
export type Database = PostgresJsDatabase<typeof schema>;
