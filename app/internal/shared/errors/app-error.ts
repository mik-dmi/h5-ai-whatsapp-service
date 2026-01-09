import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppErrors extends Error {
  status: ContentfulStatusCode;
  details?: unknown;

  constructor(status: ContentfulStatusCode, message: string, name: string, details?: unknown) {
    super(message);
    this.status = status;
    this.name = name;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toBearerOption(isProd = process.env.NODE_ENV === "production") {
    return {
      status: this.status,
      message: {
        success: false,
        error: {
          name: this.name,
          issues: [
            {
              message: isProd && this.status >= 500 ? "Internal Server Error" : this.message,
              details: isProd ? undefined : { details: this.details },
            },
          ],
        },
      },
    };
  }
}
