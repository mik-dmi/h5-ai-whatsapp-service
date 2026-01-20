import { handle } from "hono/vercel";
import createApp from "./create-app";
import { router } from "./send-message/send-message.index";
import configureOpenAPI from "@/app/internal/shared/utils/configure-open-api";

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
