import { Request, Response, NextFunction } from "express";
import { Shape as ShpaeService } from "../services";
import { getError } from "../utils/error";
import { JWTDecoded } from "../types/auth";
import * as ShapeTypes from "../types/shape";

export default class Shape {
  private shapeService = new ShpaeService();

  constructor() {
    this.getShapes = this.getShapes.bind(this);
    this.createShapes = this.createShapes.bind(this);
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

  async createShapes(
    req: Request<{}, {}, ShapeTypes.CreateShapes["req"]["data"]>,
    res: Response,
    next: NextFunction
  ) {
    const { data } = req.body; // TODO: 要將 createShape 參數換掉
    try {
      await this.shapeService.createShape({
        projectId: 1,
        orders: ["shape_1", "shape_2", "shape_3"],
        shapes: {
          shape_1: {
            w: 100,
            h: 100,
            title: "shape_1_title",
            type: ShapeTypes.Type.terminator,
            p: {
              x: 200,
              y: 200,
            },
            curves: {
              l: ["curve_1"],
              t: [],
              r: [],
              b: [],
            },
            data: [],
            selectedData: [],
          },
          shape_2: {
            w: 100,
            h: 100,
            title: "shape_2_title",
            type: ShapeTypes.Type.data,
            p: {
              x: 200,
              y: 200,
            },
            curves: {
              l: [],
              t: [],
              r: ["curve_2"],
              b: [],
            },
            data: ["data_1", "data_2", "data_3"],
            selectedData: [],
          },
          shape_3: {
            w: 100,
            h: 100,
            title: "shape_3_title",
            type: ShapeTypes.Type.process,
            p: {
              x: 200,
              y: 200,
            },
            curves: {
              l: [],
              t: [],
              r: [],
              b: ["curve_3"],
            },
            data: [],
            selectedData: ["data_1", "data_2", "data_3"],
          },
        },
        curves: {
          curve_1: {
            p1: {
              x: 100,
              y: 100,
            },
            p2: {
              x: 100,
              y: 100,
            },
            cp1: {
              x: 100,
              y: 100,
            },
            cp2: {
              x: 100,
              y: 100,
            },
            sendTo: {
              id: "shape_2",
              d: ShapeTypes.Direction.r,
            },
            text: null,
          },
          curve_2: {
            p1: {
              x: 100,
              y: 100,
            },
            p2: {
              x: 100,
              y: 100,
            },
            cp1: {
              x: 100,
              y: 100,
            },
            cp2: {
              x: 100,
              y: 100,
            },
            sendTo: {
              id: "shape_2",
              d: ShapeTypes.Direction.t,
            },
            text: null,
          },
          curve_3: {
            p1: {
              x: 100,
              y: 100,
            },
            p2: {
              x: 100,
              y: 100,
            },
            cp1: {
              x: 100,
              y: 100,
            },
            cp2: {
              x: 100,
              y: 100,
            },
            sendTo: {
              id: "shape_3",
              d: ShapeTypes.Direction.t,
            },
            text: null,
          },
        },
        data: {
          data_1: "data_1_text",
          data_2: "data_2_text",
          data_3: "data_3_text",
        },
      });
      res.status(201).send("Create shape successfully!");
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }
}
