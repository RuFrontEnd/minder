import { Request, Response, NextFunction } from "express";
import { Shape as ShpaeService } from "../services";
import { getError } from "../utils/error";
import { JWTDecoded } from "../types/auth";
import * as ShapeTypes from "../types/shape";

export default class Shape {
  private shapeService = new ShpaeService();

  constructor() {
    this.getShapes = this.getShapes.bind(this);
    this.updateShapes = this.updateShapes.bind(this);
  }

  async getShapes(
    req: Request<{}, { projectId: number }, { decoded: JWTDecoded }>,
    res: Response,
    next: NextFunction
  ) {
    const { decoded } = req.body;

    if (!decoded || typeof decoded === "string")
      return res.status(400).send("invalid user info");

    const { projectId } = req.query;
    try {
      const shapes = await this.shapeService.getShapes(Number(projectId));

      res.status(201).send(shapes);
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async updateShapes(
    req: Request<{}, {}, ShapeTypes.UpdateShapes["req"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.shapeService.updateShapes(req.body.data);
      res.status(201).send("Create shape successfully!");
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }
}
