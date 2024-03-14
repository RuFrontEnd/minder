import { Request, Response, NextFunction } from "express";

export default class Auth {
  echo(request: Request, response: Response, next: NextFunction) {
    response.type("text/plain");
    response.send("auth");
  }
}
