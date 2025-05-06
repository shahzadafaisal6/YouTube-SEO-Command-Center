import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if we're using a local database or Neon serverless
const isLocalDatabase = process.env.DATABASE_URL?.includes('localhost');

let pool;
if (isLocalDatabase) {
  // Use standard pg Pool for local development
  console.log("Using standard PostgreSQL connection for local development");
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
} else {
  // Use Neon serverless with WebSockets for production
  console.log("Using Neon Database serverless connection for production");
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
}

export const db = drizzle(pool, { schema });