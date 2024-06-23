import * as ProjectTypes from "../types/project";
import { Request, Response, NextFunction } from "express";
import { Project as ProjectService } from "../services";
import { getError } from "../utils/error";
import { JWTDecoded } from "../types/auth";
import { SUCCESSFUL, ERROR } from "../constatns/stauts";

export default class Project {
  private projectService = new ProjectService();

  constructor() {
    this.getProjects = this.getProjects.bind(this);
    this.createProject = this.createProject.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
  }

  async getProjects(
    req: Request<{}, {}, { decoded: JWTDecoded }>,
    res: Response,
    next: NextFunction
  ) {
    const { decoded } = req.body;

    try {
      const projects = await this.projectService.getProjects(
        String(decoded.userId)
      );

      res.status(201).send(projects);
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async createProject(
    req: Request<{}, {}, { decoded: JWTDecoded }>,
    res: Response,
    next: NextFunction
  ) {
    const { decoded } = req.body;

    try {
      const newProject = await this.projectService.createProject(
        String(decoded.userId)
      );

      res.status(201).send({
        status: SUCCESSFUL,
        message: "Create project successfully!",
        ...newProject,
      });
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async deleteProject(
    req: Request<{}, {}, { decoded: JWTDecoded; id: string }>,
    res: Response,
    next: NextFunction
  ) {
    const { decoded, id } = req.body;

    if (!id) return res.status(400).send("invalid project id");

    try {
      await this.projectService.deleteProject(decoded.userId, Number(id));
      res.status(201).send({
        status: SUCCESSFUL,
        message: "Delete project successfully!",
        id: Number(id),
      });
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }
}
