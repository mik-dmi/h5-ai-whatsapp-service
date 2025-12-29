import type { NotFoundHandler } from "hono";
import { NOT_FOUND, NOT_FOUND_MESSAGE } from "./errors";



const notFound: NotFoundHandler = (c) => {
  return c.json({
    message: `${NOT_FOUND_MESSAGE} - ${c.req.path}`,
  }, NOT_FOUND);
};

export default notFound;