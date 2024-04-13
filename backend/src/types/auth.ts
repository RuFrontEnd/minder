import { JwtPayload } from "jsonwebtoken";

type JWTDecoded = string | JwtPayload & { userId: number } | undefined

export type { JWTDecoded }