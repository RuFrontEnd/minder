import { Auth as AuthController } from "../controllers";
import Route from "./route";

export default class Auth extends Route {
  private authController = new AuthController();

  constructor() {
    super();
    this.prefix = '/auth'
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get("/login", this.authController.echo);
  }
}
