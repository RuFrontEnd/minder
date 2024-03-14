import { Request, Response, NextFunction } from "express";

export default class Article {
  echo(request: Request, response: Response, next: NextFunction) {
    response.type("text/plain");
    response.send("articles");
  }
}
