import { ContentfulStatusCode } from 'hono/utils/http-status';

export class InMemoryQueueError extends Error {
    statusCode: ContentfulStatusCode;

    constructor(message: string, statusCode: ContentfulStatusCode) {
        super(message);
        this.name = 'InMemoryError';
        this.statusCode = statusCode;
    }
}
