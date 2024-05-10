import mongoDbPool from "../mongodb";
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
    req: Request<{}, {}, { decoded: JWTDecoded }>,
    res: Response,
    next: NextFunction
  ) {
    // const { decoded } = req.body;
    // if (!decoded || typeof decoded === "string") return res.status(400).send("invalid user info");
    // try {
    //   const projects = await this.shapeService.getShapes(String(decoded.userId));
    //   res
    //     .status(201)
    //     .send(projects);
    // } catch (err) {
    //   res.status(400).send(getError(err));
    // }
  }

  async createShapes(
    req: Request<
      {},
      {},
      {
        projectId: string;
        shapes: {
          type: ShapeTypes.Type;
          title: ShapeTypes.Title;
          x: ShapeTypes.Vec["x"];
          y: ShapeTypes.Vec["y"];
          w: ShapeTypes.W;
          h: ShapeTypes.H;
          curve: {
            l: ShapeTypes.CurveD;
            t: ShapeTypes.CurveD;
            r: ShapeTypes.CurveD;
            b: ShapeTypes.CurveD;
          };
        }[];
        decoded: JWTDecoded;
      }
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const collection = await mongoDbPool.query("shapes");
      await collection.insertOne({
        projectId: 1,
        shapes: {
          id: "uuid",
          w: 100,
          h: 100,
          title: "title",
          p: {
            x: 200,
            y: 200,
          },
          curves: {
            l: [
              {
                shape: {
                  id: "curve_id_1",
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
                },
                sendTo: {
                  id: "uuid_shape_1",
                  d: "t",
                },
              },
            ],
            t: [
              {
                shape: {
                  id: "curve_id_2",
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
                },
                sendTo: {
                  id: "uuid_shape_2",
                  d: "t",
                },
              },
            ],
            r: [
              {
                shape: {
                  id: "curve_id_3",
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
                },
                sendTo: {
                  id: "uuid_shape_3",
                  d: "t",
                },
              },
            ],
            b: [
              {
                shape: {
                  id: "curve_id_4",
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
                },
                sendTo: {
                  id: "uuid_shape_4",
                  d: "t",
                },
              },
            ],
          },
          options: [{ id: "uuid_option", text: "data_1" }],
          selectedData: [{ id: "uuid_selectedData", text: "data_2" }],
          redundancies: [{ id: "uuid_redundancy", text: "data_3" }],
        },
      });
      res.status(201).send("Create shape successfully!");
    } catch (err) {
      console.error("Create shapes error", err);
      res.status(400).send(getError(err));
    }
  }
}
