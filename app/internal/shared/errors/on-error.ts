import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import serverEnv from "@/app/internal/shared/env/env.server";
import { ZodError } from "zod";
import { TwilioErrors } from "../../services/twilio/errors/twilio-error";

const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err ? (err.status as number) : c.newResponse(null).status;
  const statusCode = (currentStatus || 500) as ContentfulStatusCode;

  const envAux = c.env?.NODE_ENV || serverEnv.NODE_ENV;
  const isProd = envAux === "production";

  //  validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          name: "ZodError",
          issues: err.issues.map((i) => ({
            message: i.message,
            details: isProd ? undefined : i,
          })),
        },
      },
      422
    );
  }

  //  Twilio errors
  if (err instanceof TwilioErrors ) {
  return c.json(
    {
      success: false,
      error: {
        name: err.name,
        issues: [
          {
            code: err.code,
            message: isProd && err.status >= 500 ? "Internal Server Error" : err.message,
            details: isProd
              ? undefined
              : {
                  details: err.details ,
                  stack: err.stack,
                },
            },
          ],
        },  
      },
      err.status
    );
  }

//  App errors and uncatch errors
  return c.json(
    {
      success: false,
      error: {
        name: err.name ?? "Internal Error",
        issues: [
          {
            message: isProd && statusCode >= 500 ? "Internal Server Error" : err.message,
            details: isProd
              ? undefined
              : {
                  cause: err.cause,
                  stack: err.stack,
                },
            },
          ],
        },  
      },
      statusCode >= 400 ? statusCode : 503
    );
  }

export default onError;