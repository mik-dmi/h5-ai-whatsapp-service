import { handle } from "hono/vercel";
import createApp from "./create-app";
import { router } from "./send-message/send-message.index";
import configureOpenAPI from "@/app/internal/shared/utils/configure-open-api";

const baseApp = createApp();
configureOpenAPI(baseApp);

// IMPORTANT: capture the returned value so Schema includes the router
const app = baseApp.route("/", router);

export type AppType = typeof app;

export default app;
export const GET = handle(app);
export const POST = handle(app);
