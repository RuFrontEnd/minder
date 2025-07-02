// DataBase
import dotenv from "dotenv";
import { Pool } from "pg";

const env = dotenv.config().parsed;

const pool = new Pool({
  database: env?.DATABASE || "",
  host: env?.DATABASE_HOST || "",
  user: env?.DATABASE_USER || "",
  password: env?.DATABASE_PASSWORD || "",
  port: env?.DATABASE_PORT ? parseInt(env.DATABASE_PORT, 10) : 5432, // Default PostgreSQL port
});

export default pool;
