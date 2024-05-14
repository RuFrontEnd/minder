import { Shape as ShapeModel } from "../models";
import * as ShapeTypes from "../types/shape";

export default class Shape {
  private shpaeModel = new ShapeModel();

  async getShape(projectId: number) {
    const shapes = await this.shpaeModel.getShape(projectId);
    return shapes;
  }

  async createShape(data: ShapeTypes.CreateShapesData) {
    await this.shpaeModel.createShape(data);
  }
}
