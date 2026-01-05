export const STATUS_CODES = [400, 403, 404, 410,422, 503] as const;

export type AcceptedStatusCodes = (typeof STATUS_CODES)[number];

const STATUS_SET = new Set<number>(STATUS_CODES);

export class TwilioErrors extends Error {
  status: AcceptedStatusCodes;
  code: number;
  details?: object;

  constructor(rawStatus: number, message: string, name: string, code: number, details?: object) {
    super(message);
    this.status = this.standardizeStatusCode(rawStatus)
    this.code = code;
    this.name = name;
    this.details = details;
    //Object.setPrototypeOf(this, new.target.prototype);
  }

  standardizeStatusCode(status: number): AcceptedStatusCodes {
    return STATUS_SET.has(status) ? (status as AcceptedStatusCodes) : 503;
  }
}
