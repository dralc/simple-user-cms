# SimpleUserCMS

- This server provides endpoints for interacting with a Redis or Firebase db.
- It assumes:
	- you have a Redis server up and running (local or hosted)
	- OR you a hosted firebase db

## Environment variables
* DEBUG=sim
* SIM_DATASOURCE=redis OR firebase

### For a datasource of `redis`
* SIM_REDIS_HOST _(defaults to localhost)_
* SIM_REDIS_PORT _(defaults to 6379)_
- Eg. `SIM_DATASOURCE=redis npm start`

### For a datasource of `firebase`
* SIM_FIREBASE=https://your-firebase-endpoint.com
- Eg. `SIM_DATASOURCE=firebase SIM_FIREBASE=https://your-firebase-endpoint.com npm start`

## Testing
- To run integration tests: `{Environment vars} npm run test-integration`
- There are Postman example calls to this server at https://documenter.getpostman.com/view/1592722/SzRyzqB6?version=latest

