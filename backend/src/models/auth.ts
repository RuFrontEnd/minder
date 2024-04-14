import pool from "../db";
import { RowDataPacket } from "mysql2";

export default class Auth {
  // 檢查是否已存在相同的帳號
  async checkDuplicateAccountName(account: string) {
    if (!pool) return;
    const [
      rows,
    ] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE account = ?",
      [account]
    );
    return (rows as RowDataPacket[])[0].count > 0;
  }

  async create(account: string, email: string, hash: string) {
    await pool.query(
      "INSERT INTO users (account, email, password) VALUES (?, ?, ?)",
      [account, email, hash]
    );
  }

  async findByAccount(account: string): Promise<RowDataPacket[] | null> {
    const [rows] = await pool.query("SELECT * FROM users WHERE account = ?", [
      account,
    ]);
    return rows as RowDataPacket[];
  }

  echo() {
    console.log("auth model");
  }
}
