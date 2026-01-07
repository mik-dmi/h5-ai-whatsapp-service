import "server-only";
import { z, ZodError } from "zod";

const BaseEnvSchema = z.object({
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  CONTENT_SIT_CREATE_MESSAGE: z.string(),
  CURRENT_API_TOKEN: z.string(),
  NEXT_API_TOKEN: z.string().optional(),
});

const DevEnvSchema = BaseEnvSchema.extend({
  NODE_ENV: z.literal("development"),
  PRISM_URL: z.string().url(),
  TEST_TWILIO_PHONE_NUMBER: z.string(),
});

const ProdEnvSchema = BaseEnvSchema.extend({
  NODE_ENV: z.literal("production"),
  PRISM_URL: z.string().url().optional(),
  TEST_TWILIO_PHONE_NUMBER: z.string().optional(),
});

export const EnvSchema = z.discriminatedUnion("NODE_ENV", [
  DevEnvSchema,
  ProdEnvSchema,
]);

export type ServerEnv = z.infer<typeof EnvSchema>;

let serverEnv: ServerEnv;

try {
  serverEnv = EnvSchema.parse(process.env);
} catch (e) {
  const error = e as ZodError;
  console.error("error: invalid env:");
  console.error(error);
  process.exit(1);
}

export const API_TOKENS = (() => {
  const current = serverEnv.CURRENT_API_TOKEN.trim();
  const next = serverEnv.NEXT_API_TOKEN?.trim();
  return next ? [current, next] : [current];
})();

export default serverEnv;
