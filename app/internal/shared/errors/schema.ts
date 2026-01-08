import z from "zod";

export const AppIssueSchema = z.object({
  message: z.string().optional(),
  details: z.unknown().optional(), // <- generic, flexible
});

export const AppErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.object({
    name: z.string(),
    issues: z.array(AppIssueSchema),
  }),
});
