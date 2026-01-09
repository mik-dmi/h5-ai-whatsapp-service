import configureOpenAPI from "@/app/internal/shared/utils/configure-open-api";
import { handle } from "hono/vercel";
import createApp from "./create-app";
import { router } from "./send-message/send-message.index";

const app = createApp();

const routes = [
   router
];

configureOpenAPI(app);

routes.forEach((route)=>{
  app.route("/", route);
})




export const GET = handle(app);
export const POST = handle(app);
