import configureOpenAPI from "@/app/internal/shared/utils/configure-open-api";
import { handle } from "hono/vercel";
import createApp from "./create-app";
import { router as internalH5Router } from "./internal-h5/internal-h5.index";

const app = createApp();

const routes = [
   internalH5Router
];

configureOpenAPI(app);

routes.forEach((route)=>{
  app.route("/", route);
})




export const GET = handle(app);
export const POST = handle(app);
