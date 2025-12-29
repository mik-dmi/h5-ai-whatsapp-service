import { z } from "@hono/zod-openapi";

const createErrorSchema = <T extends z.ZodType>(schema: T) => {
  const { error } = schema.safeParse(undefined);

  const example = error
    ? {
        name: error.name,
        issues: error.issues.map((issue: z.core.$ZodIssue) => ({
          code: issue.code,
          path: issue.path,
          message: issue.message,
        })),
      }
    : {
        name: "ZodError",
        issues: [
          {
            code: "invalid_type",
            path: ["fieldName"],
            message: "Invalid input",
          },
        ],
      };

  return z.object({
    success: z.boolean().openapi({ example: false }),
    error: z
      .object({
        issues: z.array(
          z.object({
            code: z.string(),
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string().optional(),
          })
        ),
        name: z.string(),
      })
      .openapi({ example }),
  });
};

export default createErrorSchema;
