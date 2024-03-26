import { Auth as AuthModel } from "../models";
import validator from "validator";
import bcrypt from "bcrypt";

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

   async login(account: string, password: string): Promise<void> {
    const rows = await this.authModel.findByAccount(account);

    if (!rows || rows.length === 0) {
      throw new Error("Invalid account or password.");
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid account or password.");
    }
  }

  echo() {
    console.log("auth service");
    this.authModel.echo();
  }
}
