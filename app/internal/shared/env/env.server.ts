import "server-only";
import { z, ZodError } from "zod";



const EnvSchema = z.object({
  	NODE_ENV: z.enum(["development", "production"]).default("development"),
	LOG_LEVEL: z.enum(["fatal" , "error" , "warn" , "info" , "debug" , "trace"]),
	TWILIO_ACCOUNT_SID:z.string(),
	TWILIO_AUTH_TOKEN:z.string(),
	TWILIO_PHONE_NUMBER: z.string(),
	PRISM_URL: z.url().optional(),
	TEST_TWILIO_PHONE_NUMBER: z.string().optional(),
	CONTENT_SIT_CREATE_MESSAGE: z.string(),

}).superRefine((input, ctx) => {
  if (input.NODE_ENV != "production" && !input.PRISM_URL) {
    ctx.addIssue({
      code: "invalid_type",
      expected: "string",
      received: "undefined",
      path: ["PRISM_URL"],
      message: "Must be set when NODE_ENV is 'development'",
    });
  }
});

export type serverEnv = z.infer<typeof EnvSchema>;


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