import pool from "../db";
import mongoDbPool from "../mongodb";
import * as ProjectTypes from "../types/project";
import * as AuthTypes from "../types/auth";
import { ResultSetHeader, FieldPacket, Types } from "mysql2";

export default class Project {
  async getProjects(user: string) {
    const [rows] = await pool.query("SELECT * FROM projects WHERE user = ?", [
      user,
    ]);
    return rows as ProjectTypes.Rows;
  }

  async getProject(projectId: number) {
    const collection = await mongoDbPool.query("shapes");

    const shapes = await collection
      .find({ projectId: Number(projectId) })
      .toArray();

    const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [
      projectId,
    ]);

    shapes[0].projectName = (rows as ProjectTypes.Rows)[0].name;

    return shapes[0];
  }

  async createProject(user: string) {
    const insertInfo: [ResultSetHeader, FieldPacket[]] = await pool.query(
      "INSERT INTO projects (name, user) VALUES (?, ?)",
      ["Untitled", user]
    );

    const collection = await mongoDbPool.query("shapes");

    collection.insertOne({
      projectId: insertInfo[0].insertId,
      orders: [],
      shapes: {},
      curves: {},
      data: {},
    });

    const [rows] = await pool.query(
      "SELECT * FROM projects WHERE user = ? AND id = ?",
      [user, insertInfo[0].insertId]
    );

    const newProject = (
      rows as { id: number; user: number; name: string }[]
    )[0];

    return newProject;
  }

  async deleteProject(userId: AuthTypes.UserId, id: ProjectTypes.Id) {
    await pool.query("DELETE FROM projects WHERE user=? AND id=?", [
      userId,
      id,
    ]);

    const collection = await mongoDbPool.query("shapes");
    collection.deleteOne({ projectId: id });
  }

  echo() {
    console.log("project model");
  }
}
