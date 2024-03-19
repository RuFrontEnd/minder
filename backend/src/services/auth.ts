import { Auth as AuthModel } from "../models";

export default class Auth {
  private authModel = new AuthModel();

  echo() {
    console.log("auth service");
    this.authModel.echo();
  }
}
