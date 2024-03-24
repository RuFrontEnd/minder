import { Auth as AuthModel } from "../models";
import validator from 'validator';

export default class Auth {
  private authModel = new AuthModel();

  async register(account: string, email: string, password: string) {
    if (!validator.isEmail(email)) {
      throw new Error('invalid email format.');
    }

    const isDuplicate = await this.authModel.checkDuplicateAccountName(account);
    if (isDuplicate) {
      throw new Error('account already exists.');
    }

    await this.authModel.createUser(account, email, password);
  }

  echo() {
    console.log("auth service");
    this.authModel.echo();
  }
}
