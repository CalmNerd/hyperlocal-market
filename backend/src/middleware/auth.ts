import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { getEnv } from "../config/env.js";
import { forbidden, unauthorized } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  return jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, {
    subject: user.id,
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw unauthorized();
    }

    const token = header.slice(7).trim();
    if (!token) throw unauthorized();

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, getEnv().JWT_SECRET) as TokenPayload;
    } catch {
      throw unauthorized("Invalid or expired token");
    }

    if (!payload.sub) throw unauthorized("Invalid token");

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw unauthorized("User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}
