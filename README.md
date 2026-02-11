# Next.js app using Hono framework

A Next.js app exposing an API built with **Hono** that:

1) data is posted to `/api/v1/createMessageTemplate`  
2) formats the data into a **Twilio message template**  
3) sends the message to **Twilio** (WhatsApp)

The endpoint is protected with **Bearer token authentication**.

---

## Features

- Uses Hono framework for the API
- Uses TypeScript
- Bearer token auth for the endpoint
- Sends WhatsApp using a Twilio client
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

Receives data, formats it into a Twilio message template, and sends it via Twilio.

### Required Headers

Authorization: Bearer <CURRENT_API_TOKEN>  
Content-Type: application/json  

---

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
