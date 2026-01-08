export const NOT_FOUND = 404;
export const NOT_FOUND_MESSAGE = "Not Found"
export const UNAUTHORIZED_MESSAGE = "Not Found"
export const INTERNAL_SERVER_ERROR = 500;
export const OK = 200;
export const UNPROCESSABLE_ENTITY = 422;

// twilio 
export const TWILIO_STATUS_CODES = [400, 403, 404, 410,422, 503] as const;
export type AcceptedStatusCodes = (typeof TWILIO_STATUS_CODES)[number];
export const STATUS_SET = new Set<number>(TWILIO_STATUS_CODES);


