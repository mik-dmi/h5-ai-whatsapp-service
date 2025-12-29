import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { INTERNAL_SERVER_ERROR, OK } from "./errors";
import serverEnv from "@/app/internal/shared/env/env.server";



const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err
    ? err.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== OK
    ? (currentStatus as ContentfulStatusCode)
    : INTERNAL_SERVER_ERROR;
  const envAux = c.env?.NODE_ENV || serverEnv.NODE_ENV;

  // get default error payload for 500 for the user in production 
  const safeMessage = statusCode >= 500 ? "Internal Server Error" : err.message;

  // in production it return "save" errors to the user, in development it has full visibility 
    return c.json(
    envAux === "production"
      ? { message: safeMessage, stack: undefined }
      : { message: err.message, stack: err.stack },
    statusCode
  );
};

export default onError;