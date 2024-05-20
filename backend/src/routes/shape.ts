import { Shape as ShapeController } from "../controllers";
import Route from "./route";
import { verifyToken } from '../utils/auth'

export default class Shape extends Route {
  private shapeController = new ShapeController();

  constructor() {
    super();
    this.prefix = "/shape";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get("/shapes", verifyToken, this.shapeController.getShapes);
    this.router.put("/shapes", verifyToken, this.shapeController.updateShapes);
  }
}
