import { Request, Response, NextFunction } from "express";
import { Auth as AuthService } from "../services";
import { getError } from '../utils/error'

export default class Auth {
  private authService = new AuthService();

  constructor() {
    this.register = this.register.bind(this);
    this.echo = this.echo.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    console.log('req.body', req.body)

    const { account, email, password } = req.body;

    try {
      await this.authService.register(account, email, password);
      res.status(201).send('User registered successfully!');
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
