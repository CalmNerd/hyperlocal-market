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
  tokenVersion: number;
};

type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
  tokenVersion: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Signs a JWT that embeds the user's current tokenVersion.
 * When tokenVersion is incremented in the DB, previously issued tokens fail auth.
 */
export function signToken(user: AuthUser): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    JWT_SECRET,
    {
      subject: user.id,
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}

/**
 * Increments tokenVersion so every previously issued JWT for this user is rejected.
 * Call this from ban / password-change / logout-all flows.
 */
export async function revokeUserTokens(userId: string): Promise<number> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });
  return updated.tokenVersion;
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
      select: { id: true, email: true, role: true, tokenVersion: true },
    });

    if (!user) throw unauthorized("User no longer exists");

    // Missing claim treated as 0 so only version bumps invalidate older tokens.
    const tokenVersion = typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0;
    if (tokenVersion !== user.tokenVersion) {
      throw unauthorized("Token revoked");
    }

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
