import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import serverEnv from "@/app/internal/shared/env/env.server";
import { TwilioErrors } from "../../services/twilio/create-message/schema";
import { ZodError } from "zod";

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
            code: i.code,
            path: i.path,
            message: i.message,
            details: isProd ? undefined : i,
          })),
        },
      },
      422
    );
  }

  //  Twilio errors
  if (err instanceof TwilioErrors) {
  return c.json(
    {
      success: false,
      error: {
        name: err.name,
        issues: [
          {
            code: err.code,
            path: [],
            message: isProd && err.status >= 500 ? "Internal Server Error" : err.message,
            details: isProd
              ? undefined
              : {
                  status: err.status,
                  code: err.code,
                  details: err.details,
                  stack: err.stack,
                },
            },
          ],
        },  
      },
      err.status
    );
  }


  //  Everything else
  const safeMessage = statusCode >= 500 ? "Internal Server Error" : err.message;

  return c.json(
    {
      success: false,
      error: {
        name: err.name ?? "Internal Error",
        issues: [
          {
            code: "APP_ERROR",
            path: [],
            message: safeMessage,
            details: isProd ? undefined : { stack: err.stack },
          },
        ],
      },
    },
    statusCode >= 400 ? statusCode : 500
  );
};


export default onError;