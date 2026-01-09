import { bearerAuth } from "hono/bearer-auth";
import { API_TOKENS } from "../env/env.server";
import crypto from "node:crypto";
import { createMiddleware } from 'hono/factory'
import { AppErrors } from "../errors/app-error";

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);

  // timingSafeEqual throws if lengths differ, so guard it
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

const auth = bearerAuth({
  noAuthenticationHeader: new AppErrors(
    401,
    "No Authentication Header",
    "Unauthorized"
  ).toBearerOption(),

  invalidAuthenticationHeader: new AppErrors(
    400,
    "Invalid Authentication Header",
    "BadRequest"
  ).toBearerOption(),

  invalidToken: new AppErrors(
    401,
    "Invalid Token",
    "Unauthorized"
  ).toBearerOption(),
  verifyToken: async (token) => API_TOKENS.some((t) => safeEqual(token, t)),
})

export const bearerAuthMiddleware = createMiddleware(async (c, next) => {
  const path = c.req.path
  const isDocs = path === '/api/v1/scalar'  || path === '/api/v1/doc'     

  if (isDocs || c.req.method === 'OPTIONS') return next()
  return auth(c, next)
})
