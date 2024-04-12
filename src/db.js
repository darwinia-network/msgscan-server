import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config()

const sql = postgres({
  host: process.env.PG_HOST || 'localhost',
  username: process.env.PG_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD || 'password',
  database: process.env.PG_DATABASE || 'postgres',
  port: process.env.PG_PORT || 5432
});

export default sql
