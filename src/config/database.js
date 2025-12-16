import 'dotenv/config.js';
import process from 'process';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';




const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };