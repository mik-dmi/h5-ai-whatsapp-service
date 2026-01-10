// index.test.ts
import { testClient } from 'hono/testing'
import { app } from '../route'
import { describe, it, expect } from 'vitest' 


describe('Search Endpoint', () => {
  // Create the test client from the app instance
  const client = testClient(app )
  
  it('should turn a 200, with the message template created', async () => {
    // Call the endpoint using the typed client
    // Notice the type safety for query parameters (if defined in the route)
    // and the direct access via .$get()
    const res = await client.search.$get({
      query: { q: 'hono' },
    })

    // Assertions
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      query: 'hono',
      results: ['result1', 'result2'],
    })
  })
})