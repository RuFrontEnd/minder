import { JwtPayload } from "jsonwebtoken";

type JWTDecoded = JwtPayload & { userId: number };

type UserId = number;

export type { JWTDecoded, UserId };
