import { Request, Response, NextFunction } from "express";
import { Project as ProjectService } from "../services";
import { getError } from "../utils/error";
import { JWTDecoded } from "../types/auth"


export default class Project {
  private projectService = new ProjectService();

  constructor() {
    this.echo = this.echo.bind(this);
    this.create = this.create.bind(this);
  }

  echo(request: Request, response: Response, next: NextFunction) {
    response.type("text/plain");
    response.send("projects");
    this.projectService.echo();
  }

  async create(req: Request<{}, {}, { name: string | undefined | null, decoded: JWTDecoded }>, res: Response, next: NextFunction) {
    const { name, decoded } = req.body;

    if (!decoded || typeof decoded === "string") return res.status(400).send("invalid user info");
    if (!name) return res.status(400).send("require project name");


    console.log('decoded', decoded)
    try {
      await this.projectService.create(name, String(decoded.userId));
      res
        .status(201)
        .send("Create project successfully!");
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }
}
