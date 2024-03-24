import pool from '../db'
import { RowDataPacket } from 'mysql2';

export default class Auth {

  // 檢查是否已存在相同的帳號
  async checkDuplicateAccountName(account: string) {
    if (!pool) return
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM user WHERE account = ?', [account]);
    return (rows as RowDataPacket[])[0].count > 0
  }

  // 創建新會員
  async createUser(account: string, email: string, password: string) {
    await pool.query('INSERT INTO user (account, email, password) VALUES (?, ?, ?)', [account, email, password]);
  }

  echo() {
    console.log("auth model");
  }
}
