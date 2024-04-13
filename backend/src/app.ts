// TODO: user table 新增 create_at 欄位 / JWT token
import express, { Express, Request, Response, NextFunction } from "express";
import colors from "colors";
import pool from "./db";
import * as routes from "./routes";

pool
  .getConnection()
  .then(() => {
    const port = 5000;

    const app: Express = express();

    app.use(express.json()); // 解析 JSON 格式的請求主體
    app.use(express.urlencoded({ extended: true })); // 解析 URL-encoded 格式的請求主體

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

      next();
    });

    // load router
    for (const Route of Object.values(routes)) {
      const route = new Route();
      app.use(`${route.getglobalPrefix()}${route.getPrefix()}`, route.getRouter());
    }

    app.use((request: Request, response: Response) => {
      response.type("text/plain");
      response.status(404);
      response.send("Page is not found.");
    });

    app.listen(port, () => {
      console.log(`[server] running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(colors.red(`[db] ${err}`));
  });
