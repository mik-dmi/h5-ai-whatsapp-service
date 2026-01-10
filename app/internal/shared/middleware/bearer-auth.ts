import crypto from "node:crypto";
import { createMiddleware } from "hono/factory";
import { API_TOKENS } from "../env/env.server";
import { AppErrors } from "../errors/app-error";

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export const bearerAuthMiddleware = createMiddleware(async (c, next) => {
  const path = c.req.path;
  const isDocs = path === "/api/v1/scalar" || path === "/api/v1/doc";
  if (isDocs || c.req.method === "OPTIONS") return next();

  const auth = c.req.header("authorization");
  if (!auth) throw new AppErrors(401, "No Authentication Header", "Unauthorized", {
      expected: "Authorization: Bearer <token>",
    });

  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppErrors(400, "Invalid Authentication Header", "BadRequest", {
      expected: "Authorization: Bearer <token>",
    });
  }

  const ok = API_TOKENS.some((t) => safeEqual(token, t));
  if (!ok) throw new AppErrors(401, "Invalid Token", "Unauthorized");

  return next();
});
