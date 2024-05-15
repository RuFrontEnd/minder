import mongoDbPool from "../mongodb";
import * as ShapeTypes from "../types/shape";
import { WithId, Document, ObjectId } from "mongodb";

export default class Shape {
  async getShapes(projectId: number) {
    const collection = await mongoDbPool.query("shapes");

    const shapes = await collection
      .find({ projectId: Number(projectId) })
      .toArray();

    return shapes[0];
  }

  async createShape(data: ShapeTypes.CreateShapes["req"]["data"]) {
    const collection = await mongoDbPool.query("shapes");
    console.log("data.projectId", data.projectId);
    console.log("data", data);
    await collection.replaceOne({ projectId: 1 }, data.orders);
  }
}
