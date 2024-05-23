// mongodb DataBase
import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";

const env = dotenv.config().parsed;

class MongoDbPool {
  client: null | MongoClient;
  url: null | string;
  db: null | Db;

  constructor() {
    this.client = null;
    this.url = null;
    this.db = null;
  }

  async getConnection() {
    const url = env?.MONGO_URL;
    if (!url) throw new Error("Mongodb url is not defined.");
    const client = new MongoClient(url);
    this.client = await client.connect();
    const database = env?.DATABASE
    if (!database) throw new Error("Database is not defined.");
    this.db = this.client.db(env.DATABASE);
  }

  async query(collectionName: string) {
    if (!this.db) throw new Error("Database is not connected.");
    const collection = this.db.collection(collectionName);
    return collection;
  }
}

const mongoDbPool = new MongoDbPool();

export default mongoDbPool;
