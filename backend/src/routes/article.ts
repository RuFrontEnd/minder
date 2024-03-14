import { Article as ArticleController } from "../controllers";
import Route from "./route";

class ArticleRoute extends Route {
  private articalController = new ArticleController();

  constructor() {
    super();
    this.prefix = "/articles";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get("/", this.articalController.echo);
  }
}

export default ArticleRoute;
