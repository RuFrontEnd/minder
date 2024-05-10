// DataBase
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const env = dotenv.config().parsed;

let pool = mysql.createPool({
  database: env?.DATABASE ? env.DATABASE : "",
  host: env?.DATABASE_HOST ? env.DATABASE_HOST : "",
  user: env?.DATABASE_USER ? env.DATABASE_USER : "",
  password: env?.DATABASE_PASSWORD ? env.DATABASE_PASSWORD : "",
});

export default pool;
