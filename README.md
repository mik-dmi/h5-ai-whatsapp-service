# Next.js app using Hono framework

A Next.js app exposing an API built with **Hono**

- Endpoint »`/api/v1/createMessageTemplate`:

1. payload with users messages is posted to `/api/v1/createMessageTemplate`
2. each message is formated into a **Twilio message template**
3. message is queued in an in-memory queue and stored in a db
4. the a payload is return to the user with an index (correspondes to the position of the message in the pazload posted but the user), the messageId (id of the message in the db) and an accepted value the says whether or not he message was stored in the db and enqueue to then be processed

(ps: `/api/v1/createMessageTemplate` is protected with **Bearer token authentication**.)

- Endpoint »`/api/v1/postMessageStatus`:

1. Twilio callback function will post message status updates to this endpoint.
2. the endpoint gets this information and updated the status of the message in db

(ps: `/api/v1/postMessageStatus` is NOT protected with **authentication** but in the future it is possible to add a basic auth that works with the twilio callback function)

---

## Features

- Uses Hono framework for the API
- Uses TypeScript
- Uses Prisma
- Uses Supabase
- Bearer token auth for an endpoint
- Sends WhatsApp using a Twilio client
- It has an in-memory queue
- Development environment with a mock Twilio server using docker-compose
- Structured logging
- OpenAPI documentation and capability to test endpoints at `/api/v1/scalar`

---

## API Authentication

All requests must include:

Authorization: Bearer <API_TOKEN>

If the token is missing or invalid, the API returns **401 Unauthorized**.

---

## Environment Variables

Create a `.env.local` file to set up your development environment (follow `.env.local.template` to see what variables are needed).

---

## Endpoint

POST /api/v1/createMessageTemplate

Receives data (array of messages), formats them it into a Twilio message template, stores them in the DB, and Enqueues the messages.

### Required Headers

Authorization: Bearer <CURRENT_API_TOKEN>  
Content-Type: application/json

---

### Prisma + Supabase Setup

This project uses Prisma with Supabase Postgres.

After configuring your environment variables, run:

npx prisma generate
npx prisma migrate dev

If your Supabase database schema already exists and you only want to sync Prisma locally, you may also use:

npx prisma db pull
npx prisma generate

Notes
Use npx prisma migrate dev when Prisma manages the schema.
Use npx prisma db pull if Supabase already has the tables and you want Prisma to introspect them.
Ensure your database connection string is correctly set in .env.local.

## Local Development

npm install  
npm run dev

---

## Mock Twilio (development)

This project supports a mocked Twilio server using Prism + docker-compose.

Start by:

cd docker/development

Then for AMD64 machines:

docker compose -f docker-compose.yml up -d

Then for ARM machines:

docker compose -f docker-compose.arm.yml up

---

## Testing the postMessageStatus endpoint in the development environment using ngrok

Start by installing ngrok, then run the following command (use the port 3000, where the API is running):

ngrok http 3000

## OpenAPI / Scalar

Docs available at:

/api/v1/scalar

---

## Run Tests

npm run test

---

## Things still missing

- Rate limiter
- Possible IP limiter for production
- External queue to manage rate limits and other worst case scenarios
- Futher improve the error responses
- Add examples to the Scalar docs
- Basic auth in the status endpoint
- Add an endpoint to check the status of each message using the `message_id`
