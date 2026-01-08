// twilio 
export const TWILIO_STATUS_CODES = [400, 403, 404, 410,422, 503] as const;
export type AcceptedStatusCodes = (typeof TWILIO_STATUS_CODES)[number];
export const STATUS_SET = new Set<number>(TWILIO_STATUS_CODES);

