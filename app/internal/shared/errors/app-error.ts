import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppErrors extends Error {
  status: ContentfulStatusCode;
  details?: object;

  constructor(
    resStatus: ContentfulStatusCode,
    name: string,
    message: string,
    details?: object
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = resStatus;
    this.name = name;
    this.details = details;
  }

  // converts to what bearerAuth expects
  toBearerOption() {
    return {
      status: this.status,
      message: {
        status: this.status,
        error: {
          name: this.name,
          message: this.message,
          details: this.details,
        },
      },
    };
  }
}
