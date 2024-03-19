import { Request, Response, NextFunction } from "express";
import { Auth as AuthService } from "../services";

export default class Auth {
  private authService = new AuthService();

  constructor() {
    this.echo = this.echo.bind(this);
  }

  echo(request: Request, response: Response, next: NextFunction) {
    response.type("text/plain");
    response.send("auth");
    this.authService.echo();
  }
}
