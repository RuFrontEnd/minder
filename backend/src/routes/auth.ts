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
    this.router.post("/register", this.authController.register);
    this.router.get("/login", this.authController.echo);
  }
}
