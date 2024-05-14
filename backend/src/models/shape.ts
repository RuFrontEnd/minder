import mongoDbPool from "../mongodb";
import * as ShapeTypes from "../types/shape";

export default class Shape {
  async getShapes(projectId: number) {
    const collection = await mongoDbPool.query("shapes");

    const shapes = await collection
      .find({ projectId: Number(projectId) })
      .toArray();

    return shapes;
  }

  async createShape(data: ShapeTypes.CreateShapesData) {
    const collection = await mongoDbPool.query("shapes");
    await collection.insertOne(data);
  }
}
