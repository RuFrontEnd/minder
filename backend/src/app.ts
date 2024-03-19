import express, { Express, Request, Response, NextFunction } from "express";
import * as routes from "./routes";

const port = 5000;

const app: Express = express();

app.use((request: Request, response: Response, next: NextFunction) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE"
  );

  next();
});

// load router
for (const Route of Object.values(routes)) {
  const route = new Route();
  app.use(route.getPrefix(), route.getRouter());
}

app.use((request: Request, response: Response) => {
  response.type("text/plain");
  response.status(404);
  response.send("Page is not found.");
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
