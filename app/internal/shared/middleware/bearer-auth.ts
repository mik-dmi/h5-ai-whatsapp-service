import crypto from "node:crypto";
import { createMiddleware } from "hono/factory";
import { API_TOKENS } from "../env/env.server";
import { AppErrors } from "../errors/app-error";
import { INVALID_AUTHENTICATION_HEADER, INVALID_AUTHENTICATION_HEADER_MESSAGE, INVALID_TOKEN, INVALID_TOKEN_MESSAGE, NO_AUTHENTICATION_HEADER, NO_AUTHENTICATION_HEADER_MESSAGE } from "../errors/errors-constant";

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export const bearerAuthMiddleware = createMiddleware(async (c, next) => {
  const path = c.req.path;
  const isDocs = path === "/api/v1/scalar" || path === "/api/v1/doc" || path === "/api/v1/postMessageStatus";
  if (isDocs || c.req.method === "OPTIONS") return next();

  const auth = c.req.header("authorization");
  if (!auth) throw new AppErrors(401, NO_AUTHENTICATION_HEADER , NO_AUTHENTICATION_HEADER_MESSAGE, {
      expected: "Authorization: Bearer <token>",
    });

  const [scheme, token] = auth.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new AppErrors(401, INVALID_AUTHENTICATION_HEADER, INVALID_AUTHENTICATION_HEADER_MESSAGE, {
      expected: "Authorization: Bearer <token>",
    });
  }

  const ok = API_TOKENS.some((t) => safeEqual(token, t));
  if (!ok) throw new AppErrors(401, INVALID_TOKEN, INVALID_TOKEN_MESSAGE);

  return next();
});
