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
    this.router.get("/projects", verifyToken, this.projectController.getProjects);
    this.router.get("/projects/:id", verifyToken, this.projectController.getProject);
    this.router.post("/project", verifyToken, this.projectController.createProject);
    this.router.put("/projects/:id", verifyToken, this.projectController.updateProject);
    this.router.put("/projects/:id/name", verifyToken, this.projectController.updateProjectName);
    this.router.delete("/project", verifyToken, this.projectController.deleteProject);
  }
}
