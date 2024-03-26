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
      await this.authModel.createUser(account, email, hash);
    });
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

    if (!env?.JWTSIGN) {
      throw new Error("None of jwt sign");
    }

    const token = jwt.sign({ userId: user.id }, env.JWTSIGN, {
      expiresIn: "1m",
    });

    return token;
  }

  echo() {
    console.log("auth service");
    this.authModel.echo();
  }
}
