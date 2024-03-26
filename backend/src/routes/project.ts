import { Project as ProjectController } from "../controllers";
import Route from "./route";

export default class Project extends Route {
  private projectController = new ProjectController();

  constructor() {
    super();
    this.prefix = "/projects";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get("/", this.projectController.echo);
  }
}
