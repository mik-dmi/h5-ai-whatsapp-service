import type { Hook } from "@hono/zod-openapi";
import type { AppBindings } from "@/app/internal/shared/types/types";
import { UNPROCESSABLE_ENTITY } from "../errors/errors-constant";

const defaultHook: Hook<unknown, AppBindings, string, Response | void> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: false,
        error: {
          name: result.error.name,
          issues: result.error.issues,
        },
      },
      UNPROCESSABLE_ENTITY
    );
  }
};

export default defaultHook;
