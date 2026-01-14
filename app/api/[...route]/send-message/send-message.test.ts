// index.test.ts
import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest' 
import serverEnv from '@/app/internal/shared/env/env.server'
import createApp from '../create-app'
import { router } from './send-message.index'
import { INVALID_TOKEN, INVALID_TOKEN_MESSAGE, NO_AUTHENTICATION_HEADER, NO_AUTHENTICATION_HEADER_MESSAGE } from '@/app/internal/shared/errors/errors-constant'

describe('Search Endpoint, ', () => {
  // Create the test client from the app instance
	const testApp = createApp()
	const testRouter = testApp.route("/", router);
	
	const client = testClient(testRouter);
  
  it('create a message', async () => {
    
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

  it('validate Authorization header when creating message', async () => {
    
	const res =  await client.api.v1.createMessageTemplate.$post(
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
	if(res.status === 401){
		const jsonResponse = await res.json()
		expect(jsonResponse.error.name).toBe(NO_AUTHENTICATION_HEADER);
		expect(jsonResponse.error.issues[0].message).toBe(NO_AUTHENTICATION_HEADER_MESSAGE);
	}
  })

  it('validate Authorization Token when creating message', async () => {
    
	const token = "invalid_token"
	

	const res =  await client.api.v1.createMessageTemplate.$post(
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
    expect(res.status).toBe(401);
	if(res.status === 401){
		const jsonResponse = await res.json()
		expect(jsonResponse.error.name).toBe(INVALID_TOKEN);
		expect(jsonResponse.error.issues[0].message).toBe(INVALID_TOKEN_MESSAGE);
	}
  })
  it('validate the body of request when creating message', async () => {
    
	const token = serverEnv.CURRENT_API_TOKEN

	const res =  await client.api.v1.createMessageTemplate.$post(
	{ 
	// @ts-expect-error	there is one property missing from the json on purpose
	json: { 
		"date": "11/12/2024",
	  	"time": "11:00pm",
	  	"phone_number": "12332234231",
	  	
	 } },
	{ headers: 
		{ 
			'Authorization': `Bearer ${token}`,
			'Content-Type': `application/json`

		},
		
	}
	)	
    expect(res.status).toBe(422);
	if(res.status === 422){
		const jsonResponse = await res.json()
		expect(jsonResponse.error.name).toBe("ZodError");
	}
  })
})