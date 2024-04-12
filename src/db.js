import postgres from 'postgres'

const sql = postgres({
  host: 'localhost',
  username: 'postgres',
  password: 'password',
  database: 'postgres',
});

export default sql
