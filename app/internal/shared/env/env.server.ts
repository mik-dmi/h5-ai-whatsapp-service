import "server-only";
import { z } from "zod";



const BaseEnvSchema = z.object({
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  CONTENT_SIT_CREATE_MESSAGE: z.string(),
});

const DevEnvSchema = BaseEnvSchema.extend({
  NODE_ENV: z.literal("development"),
  PRISM_URL: z.url(),
  TEST_TWILIO_PHONE_NUMBER: z.string(),
});

const ProdEnvSchema = BaseEnvSchema.extend({
  NODE_ENV: z.literal("production"),
  PRISM_URL: z.url().optional(),
  TEST_TWILIO_PHONE_NUMBER: z.string().optional(),
});

export const EnvSchema = z.discriminatedUnion("NODE_ENV", [
  DevEnvSchema,
  ProdEnvSchema,
]);

export type ServerEnv = z.infer<typeof EnvSchema>;


const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;

/*
let serverEnv :serverEnv 

try{
	serverEnv = EnvSchema.parse(process.env);

}
catch(e){
	const error = e as ZodError;
	console.error("error: invalid env:")
	console.error(error);
	process.exit(1)
}



export default serverEnv;
*/