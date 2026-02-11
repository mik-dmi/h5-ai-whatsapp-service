import { AcceptedStatusCodes, STATUS_SET } from "./status-codes";

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
	Object.setPrototypeOf(this, new.target.prototype);
  }

  standardizeStatusCode(status: number): AcceptedStatusCodes {
	return STATUS_SET.has(status) ? (status as AcceptedStatusCodes) : 503;
  }
}