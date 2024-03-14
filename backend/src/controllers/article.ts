import { Request, Response, NextFunction } from "express";
import { Article as ArticleService } from "../services";

export default class Article {
  private authService = new ArticleService();

  constructor() {
    this.echo = this.echo.bind(this);
  }

  echo(request: Request, response: Response, next: NextFunction) {
    response.type("text/plain");
    response.send("articles");
    this.authService.echo();
  }
}
