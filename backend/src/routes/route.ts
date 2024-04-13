import { Router } from "express";

abstract class Route {
  protected router = Router();
  protected abstract setRoutes(): void;
  protected globalPrefix: string = "/api";
  protected prefix: string = "/";

  public getglobalPrefix() {
    return this.globalPrefix;
  }

  public getPrefix() {
    return this.prefix;
  }

  public getRouter() {
    return this.router;
  }

}

export default Route;
