import { serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import {pgTable} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: varchar('password', { length: 512 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('user'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})