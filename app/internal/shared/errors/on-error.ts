import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { INTERNAL_SERVER_ERROR, OK } from "./errors";
import serverEnv from "@/app/internal/shared/env/env.server";
import { TwilioErrors } from "../../services/twilio/create-message/schema";

const onError: ErrorHandler = (err, c) => {

  const currentStatus = "status" in err ? err.status : c.newResponse(null).status;

  const statusCode = currentStatus !== OK ? (currentStatus as ContentfulStatusCode): INTERNAL_SERVER_ERROR;
  
  const envAux = c.env?.NODE_ENV || serverEnv.NODE_ENV;
  const isProd = envAux === "production";

  const safeMessage = statusCode >= 500 ? "Internal Server Error" : err.message;

  const baseIssue = {
    code: "APP_ERROR",
    path: [],
    message: isProd ? safeMessage : err.message,
  };

  // If it's your Twilio error, include a better code
  const issue =
    err instanceof TwilioErrors
      ? {
          code: err.code, 
          path: [],
          message: isProd ? safeMessage : err.message,
        }
      : baseIssue;

  return c.json(
    {
      success: false,
      error: {
        name: err.name ?? "Error",
        issues: [issue],
      },
    },
    statusCode
  );
};

export default onError;