import { handle } from "hono/vercel";
import createApp from "./create-app";
import configureOpenAPI from "@/app/internal/shared/utils/configure-open-api";

const app = createApp();
configureOpenAPI(app);



export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
