




import z from "zod";

export const TwilioIssueSchema = z.object({
  code: z.string(),
  message: z.string().optional(),
  details: z.unknown().optional(), // <- generic, flexible
});

export const TwilioErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.object({
    name: z.string(),
    issues: z.array(TwilioIssueSchema),
  }),
});
