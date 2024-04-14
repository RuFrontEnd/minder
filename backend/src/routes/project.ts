import { Project as ProjectController } from "../controllers";
import Route from "./route";
import { verifyToken } from '../utils/auth'

export default class Project extends Route {
  private projectController = new ProjectController();

  constructor() {
    super();
    this.prefix = "/project";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get("/", this.projectController.echo);
    this.router.post("/create", verifyToken, this.projectController.create);
  }
}
