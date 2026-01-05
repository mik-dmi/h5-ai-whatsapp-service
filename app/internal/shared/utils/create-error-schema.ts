import { z } from "@hono/zod-openapi";

const createErrorSchema = <T extends z.ZodType>(schema: T) => {
  const { error } = schema.safeParse(undefined);
/*
 --> if necessary to add an exemple to the docs  
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
        name: "string",
        issues: [
          {
            code: "number",
            path: ["fieldName"],
            message: "Invalid input",
          },
        ],
      };
*/
  return z.object({
    success: z.literal(false) /*.openapi({ example: false }) */,
    error: z
      .object({
        name: z.string(),
        issues: z.array(
          z.object({
            code: z.string(),
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string().optional(),
            details: z.unknown().optional(),
          })
        ),
      })
      /*.openapi({ example })*/,
  });
};

export default createErrorSchema;
