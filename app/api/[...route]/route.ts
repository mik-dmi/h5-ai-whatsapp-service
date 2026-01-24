import { handle } from "hono/vercel";
import createApp from "./create-app";
import configureOpenAPI from "@/app/internal/shared/utils/configure-open-api";
import { router } from "./twilio-whatapp-message/send-message.index";

const app = createApp();

const routes = [
	router
]
configureOpenAPI(app);

routes.forEach((route)=>{
	app.route("/", route);
})


export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
