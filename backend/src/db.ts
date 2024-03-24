// DataBase
import dotenv from 'dotenv'
import mysql from 'mysql';

const env = dotenv.config().parsed

const connectDb = () => {
  console.log('env',env)
  if (!env) return

  const connection = mysql.createConnection({
    database: env.DATABASE,
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
  });

  connection.connect(err => {
    if (err) {
      console.log('connecting error', err);
    } else {
      console.log('connecting success');
    }
  });
}


export default connectDb;