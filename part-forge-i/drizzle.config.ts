import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load from .env.local so CLI has access to DATABASE_URL
config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
});