import { Auth as AuthModel } from "../models";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

export default class Auth {
  private authModel = new AuthModel();

  async register(account: string, email: string, password: string) {
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format.");
    }

    const isDuplicate = await this.authModel.checkDuplicateAccountName(account);
    if (isDuplicate) {
      throw new Error("Account already exists.");
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      await this.authModel.create(account, email, hash);
    });
  }

  async jwtLogin(token: string): Promise<boolean> {
    if (!token || !env?.SECRETKEY) {
      return false;
    }

    let isPass = false;

    jwt.verify(token, env.SECRETKEY, (err, decoded) => {
      if (err) {
        isPass = false;
      } else {
        isPass = true;
      }
    });

    return isPass;
  }

  async login(account: string, password: string): Promise<string> {
    const rows = await this.authModel.findByAccount(account);

    if (!rows || rows.length === 0) {
      throw new Error("Invalid account or password.");
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid account or password.");
    }

    if (!env?.SECRETKEY) {
      throw new Error("None of jwt sign");
    }

    const token = jwt.sign({ userId: user.id }, env.SECRETKEY, {
      expiresIn: "90d",
    });

    return token;
  }

  echo() {
    console.log("auth service");
    this.authModel.echo();
  }
}
