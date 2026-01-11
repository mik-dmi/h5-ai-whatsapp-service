// index.test.ts
import { testClient } from 'hono/testing'
import  app, { AppType } from '../route'
import { describe, it, expect } from 'vitest' 
import serverEnv from '@/app/internal/shared/env/env.server'
import { messageStatusValues } from './schema'


describe('Search Endpoint', () => {
  // Create the test client from the app instance
  const client = testClient<AppType>(app  );
  
  it('should turn a 200, with the message template created', async () => {
    
	const token = serverEnv.CURRENT_API_TOKEN

	const res = await client.api.v1.createMessageTemplate.$post(
	{ json: { 
		date: "11/12/2024",
	  	time: "11:00pm",
	  	phone_number: "12332234231",
	  	first_name: "Mike"
	 } },
	{ headers: { Authorization: `Bearer ${token}` } }
	)

    // Assertions
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
    	success: true,
		status: messageStatusValues, 
    })
  })
})