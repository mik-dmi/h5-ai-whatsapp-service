//import "server-only";
import { z, ZodError } from "zod";

const BaseEnvSchema = z.object({
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace","silent"]),
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  CONTENT_SIT_CREATE_MESSAGE: z.string(),
  CURRENT_API_TOKEN: z.string(),
  NEXT_API_TOKEN: z.string(),
  DATABASE_URL: z.string(),
  CONNECT_TO_TWILIO:z.enum(["true", "false"]).transform((v) => v === "true"),
});

const DevEnvSchema = BaseEnvSchema.extend({
  APP_ENV: z.literal("development"),
  PRISM_URL: z.string().url(),
  TEST_TWILIO_PHONE_NUMBER: z.string(),
});

const ProdEnvSchema = BaseEnvSchema.extend({
  APP_ENV: z.literal("production"),
  PRISM_URL: z.string().url().optional(),
  TEST_TWILIO_PHONE_NUMBER: z.string().optional(),
});

const TestEnvSchema = BaseEnvSchema.extend({
  APP_ENV: z.literal("test"),
  PRISM_URL: z.string().url(),
  TEST_TWILIO_PHONE_NUMBER: z.string(),
});

export const EnvSchema = z.discriminatedUnion("APP_ENV", [
  DevEnvSchema,
  ProdEnvSchema,
  TestEnvSchema,
]);

export type ServerEnv = z.infer<typeof EnvSchema>;

let serverEnv: ServerEnv;

try {
  serverEnv = EnvSchema.parse(process.env);
} catch (e) {
  const error = e as ZodError;
  console.error("error: invalid env:");
  console.error(error);
  if (process.env.APP_ENV === "test") {
    throw error; // fail the test nicely
  }
  process.exit(1);
}

export const API_TOKENS = (() => {
  const current = serverEnv.CURRENT_API_TOKEN.trim();
  const next = serverEnv.NEXT_API_TOKEN?.trim();
  return next ? [current, next] : [current];
})();

export default serverEnv;
