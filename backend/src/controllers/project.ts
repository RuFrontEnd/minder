import jwt from "jsonwebtoken";
import * as ProjectTypes from "../types/project";
import { Request, Response, NextFunction } from "express";
import { Project as ProjectService } from "../services";
import { getError } from "../utils/error";
import { JWTDecoded } from "../types/auth";
import * as statuses from "../constatns/stauts";

export default class Project {
  private projectService = new ProjectService();

  constructor() {
    this.getProjects = this.getProjects.bind(this);
    this.getProject = this.getProject.bind(this);
    this.createProject = this.createProject.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.updateProjectName = this.updateProjectName.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
  }

  async getProjects(
    req: Request<{}, {}, { decoded: JWTDecoded }>,
    res: Response,
    next: NextFunction
  ) {
    const { decoded } = req.body;

    try {
      const projects: Omit<ProjectTypes.Project, "user">[] =
        await this.projectService.getProjects(Number(decoded.userId));

      res.status(200).send(projects);
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async getProject(
    req: Request<{ id: string }, { decoded: JWTDecoded }>,
    res: Response,
    next: NextFunction
  ) {
    const { authorization: bearerToken } = req.headers;

    if (!bearerToken) {
      return res.status(400).send({
        status: statuses.ERROR,
        message: "Missing token.",
      });
    }

    try {
      const tokenInfo = jwt.decode(bearerToken.replace("Bearer ", ""));

      if (typeof tokenInfo === "string") {
        return res.status(400).send({
          status: statuses.ERROR,
          message: "Invalid token info.",
        });
      }
      if (!!tokenInfo?.userId) {
        const projects = await this.projectService.getProjects(
          Number(tokenInfo.userId)
        );
        const userIds = projects.map((project) => project.id);

        if (userIds.includes(Number(req.params.id))) {
          const project = await this.projectService.getProject(
            Number(req.params.id)
          );
          res.status(200).send(project);
        } else {
          return res.status(400).send({
            status: statuses.ERROR,
            message: "The project is not belong to the current user.",
          });
        }
      } else {
        return res.status(400).send({
          status: statuses.ERROR,
          message: "Invalid user id.",
        });
      }
    } catch (err) {
      return res.status(400).send({
        status: statuses.ERROR,
        message: err,
      });
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
        status: statuses.SUCCESSFUL,
        message: "Create project successfully!",
        ...newProject,
      });
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async updateProject(
    req: Request<{ id: string }, {}, ProjectTypes.UpdateProject["req"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const updatedProject = await this.projectService.updateProject(
        Number(req.params.id),
        req.body.data
      );

      res.status(200).send({
        status: statuses.SUCCESSFUL,
        message: "Update project successfully!",
        data: updatedProject,
      });
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async updateProjectName(
    req: Request<{ id: string }, {}, ProjectTypes.UpdateProjectName["req"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const newName = await this.projectService.updateProjectName(
        Number(req.params.id),
        req.body.data
      );

      res.status(201).send({
        status: statuses.SUCCESSFUL,
        message: "Update project name successfully!",
        name: newName,
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
        status: statuses.SUCCESSFUL,
        message: "Delete project successfully!",
        id: Number(id),
      });
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }
}
