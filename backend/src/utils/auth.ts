import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  if (!env?.JWTSIGN) {
    throw new Error("Missing jwt sign");
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Missing token");
  }

  // 驗證 JWT
  jwt.verify(token, env.JWTSIGN, (err, decoded) => {
    if (err) {
      throw new Error("Invalid token");
    } else {
      next();
    }
  });
};

export { authenticateToken };
