import { neon } from "@neondatabase/serverless";

export const getSql = () => {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
};
