import { createRouter } from "../create-app";
import * as handlers from "./internal-h5.handler";
import * as routes from "./internal-h5.routes"


export const router = createRouter().openapi(routes.list , handlers.list)



