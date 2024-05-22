import pool from "../db";
import mongoDbPool from "../mongodb";
import { ResultSetHeader, FieldPacket } from "mysql2";

export default class Project {
  async getProjects(user: string) {
    const [rows] = await pool.query("SELECT * FROM projects WHERE user = ?", [
      user,
    ]);
    return rows as { id: number; user: number; name: string }[];
  }

  async createProject(user: string) {
    const insertInfo: [
      ResultSetHeader,
      FieldPacket[]
    ] = await pool.query("INSERT INTO projects (name, user) VALUES (?, ?)", [
      "Untitled",
      user,
    ]);

    const collection = await mongoDbPool.query("shapes");

    collection.insertOne({
      projectId: insertInfo[0].insertId,
      orders: [],
      shapes: {},
      curves: {},
      data: {},
    });
  }

  echo() {
    console.log("project model");
  }
}
