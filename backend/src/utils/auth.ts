import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  if (!env?.SECRETKEY) {
    return res.send("Missing secret key")
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.send("Missing token")
  }

  // 驗證 JWT
  jwt.verify(token, env.SECRETKEY, (err, decoded) => {
    if (err) {
      return res.send("Invalid token")
    } else {
      req.body.decoded = decoded
      next();
    }
  });
};

export { verifyToken };
