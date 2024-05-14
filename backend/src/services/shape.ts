import { Shape as ShapeModel } from "../models";
import * as ShapeTypes from "../types/shape";

export default class Shape {
  private shpaeModel = new ShapeModel();

  async getShapes(projectId: number) {
    const shapes = await this.shpaeModel.getShapes(projectId);
    return shapes;
  }

  async createShape(data: ShapeTypes.CreateShapesData) {
    await this.shpaeModel.createShape(data);
  }
}
