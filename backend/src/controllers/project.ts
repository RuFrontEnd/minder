import { Request, Response, NextFunction } from "express";
import { Project as ProjectService } from "../services";

export default class Project {
  private projectService = new ProjectService();

  constructor() {
    this.echo = this.echo.bind(this);
  }

  echo(request: Request, response: Response, next: NextFunction) {
    response.type("text/plain");
    response.send("projects");
    this.projectService.echo();
  }
}
