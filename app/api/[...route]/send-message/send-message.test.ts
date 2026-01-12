// index.test.ts
import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest' 
import serverEnv from '@/app/internal/shared/env/env.server'
import createApp from '../create-app'
import { router } from './send-message.index'

describe('Search Endpoint, ', () => {
  // Create the test client from the app instance
	const testApp = createApp()
	const testRouter = testApp.route("/", router);
	
	const client = testClient(testRouter);
  
  it('should turn a 200, with the message template created', async () => {
    
	const token = serverEnv.CURRENT_API_TOKEN

	const res = await client.api.v1.createMessageTemplate.$post(
	{ json: { 
		"date": "11/12/2024",
	  	"time": "11:00pm",
	  	"phone_number": "12332234231",
	  	"first_name": "Mike_e"
	 } },
	{ headers: 
		{ 
			'Authorization': `Bearer ${token}`,
			'Content-Type': `application/json`

		},
	}
	)	
    expect(res.status).toBe(200)
  })

  it('should fail a 401, lack of Authorization headers', async () => {
    

	const res = await client.api.v1.createMessageTemplate.$post(
	{ json: { 
		"date": "11/12/2024",
	  	"time": "11:00pm",
	  	"phone_number": "12332234231",
	  	"first_name": "Mike_e"
	 } },
	{ headers: 
		{ 
			
			'Content-Type': `application/json`

		},
		
	}
	)	
    expect(res.status).toBe(401);
	
  })
})