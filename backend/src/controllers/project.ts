import { Request, Response, NextFunction } from "express";
import { Project as ProjectService } from "../services";
import { getError } from "../utils/error";
import { JWTDecoded } from "../types/auth"


export default class Project {
  private projectService = new ProjectService();

  constructor() {
    this.getProjects = this.getProjects.bind(this);
    this.createProject = this.createProject.bind(this);
  }

  async getProjects(req: Request<{}, {}, { decoded: JWTDecoded }>, res: Response, next: NextFunction) {
    const { decoded } = req.body;

    if (!decoded || typeof decoded === "string") return res.status(400).send("invalid user info");

    try {
      const projects = await this.projectService.getProjects(String(decoded.userId));

      res
        .status(201)
        .send(projects);
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async createProject(req: Request<{}, {}, { name: string | undefined | null, decoded: JWTDecoded }>, res: Response, next: NextFunction) {
    const { name, decoded } = req.body;

    if (!decoded || typeof decoded === "string") return res.status(400).send("invalid user info");
    if (!name) return res.status(400).send("require project name");
    try {
      await this.projectService.createProject(name, String(decoded.userId));
      res
        .status(201)
        .send("Create project successfully!");
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }
}
