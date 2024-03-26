import { Request, Response, NextFunction } from "express";
import { Auth as AuthService } from "../services";
import { getError } from "../utils/error";

export default class Auth {
  private authService = new AuthService();

  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.echo = this.echo.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const { account, email, password } = req.body;

    try {
      await this.authService.register(account, email, password);
      res.status(201).send("User registered successfully!");
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { account, password } = req.body;

    try {
      const token = await this.authService.login(account, password);
      res
        .status(201)
        .setHeader("Authorization", `Bearer ${token}`)
        .send("User login successfully!");
    } catch (err) {
      res.status(400).send(getError(err));
    }
  }

  echo(req: Request, res: Response, next: NextFunction) {
    res.type("text/plain");
    res.send("auth");
    this.authService.echo();
  }
}
