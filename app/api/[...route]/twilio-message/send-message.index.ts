import { createRouter } from "../create-app";
import * as handlers from "./send-message.handler";
import * as routes from "./send-message.routes"


export const router = createRouter()
.openapi(routes.createTwillioWpMessage , handlers.createTwillioWpMessageHandler )
.openapi(routes.twillioWpMessageStatus , handlers.twillioWpMessageStatusHandler )



