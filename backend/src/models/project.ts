import pool from "../db";

export default class Project {
  async create(name: string, user: string) {
    await pool.query(
      "INSERT INTO projects (name, user) VALUES (?, ?)",
      [name, user]
    );
  }

  echo() {
    console.log("project model");
  }
}
