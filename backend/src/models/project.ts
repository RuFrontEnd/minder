import pool from "../db";
import { RowDataPacket } from "mysql2";

export default class Project {
  async getProjects(user: string) {
    const [rows] = await pool.query("SELECT * FROM projects WHERE user = ?", [
      user,
    ]);
    return rows as { id: number; user: number; name: string }[];
  }

  async createProject(user: string) {
    await pool.query("INSERT INTO projects (name, user) VALUES (?, ?)", [
      "Untitled",
      user,
    ]);
  }

  echo() {
    console.log("project model");
  }
}
