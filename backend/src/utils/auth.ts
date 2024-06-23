import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  if (!env?.SECRETKEY) {
    throw new Error("Missing secret key.");
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).send("Missing token.");
  }

  // 驗證 JWT
  jwt.verify(token, env.SECRETKEY, (err, decoded) => {
    if (err) {
      return res.send("Invalid token.");
    } else {
      if (!decoded || typeof decoded === "string") {
        return res.status(400).send("invalid user info");
      } else {
        req.body.decoded = decoded;
        next();
      }
    }
  });
};

export { verifyToken };
