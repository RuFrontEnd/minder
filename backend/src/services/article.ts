import { Article as ArticleModel } from "../models";

export default class Article {
  private articleModel = new ArticleModel();

  echo() {
    console.log("article service");
    this.articleModel.echo();
  }
}
