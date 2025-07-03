import type { Config } from 'drizzle-kit';

export default {
  schema: './src/config/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require',
  },
} satisfies Config;