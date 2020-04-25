# SimpleUserCMS

- This server provides endpoints for interacting with a Redis or Firebase db.
- It assumes:
	- you have a Redis server up and running (local or hosted)
	- OR you a hosted firebase db

![Architecture](images/architecture.png)

## Environment variables
* DEBUG=sim
* SIM_DATASOURCE=redis OR firebase
* APP=appGraphql OR app
* NODE_ENV=production (disables graphql playground and introspection)

### For a datasource of `redis`
* SIM_REDIS_HOST _(defaults to localhost)_
* SIM_REDIS_PORT _(defaults to 6379)_
> Eg. `SIM_DATASOURCE=redis npm start`

### For a datasource of `firebase`
* SIM_FIREBASE=https://your-firebase-endpoint.com
> Eg. `SIM_DATASOURCE=firebase SIM_FIREBASE=https://your-firebase-endpoint.com npm start`

## Testing
- To run unit and integration tests together: `npm test`
- To run integration tests: `{Environment vars} npm run test:integration`
- There are Postman example calls to this server at:
	- _GraphQL_: https://documenter.getpostman.com/view/1592722/SzezcXcj?version=latest
	- _REST_:  https://documenter.getpostman.com/view/1592722/SzRyzqB6?version=latest

## Graphql
* Graphql Playground is available at http://localhost:3000/graphql
* `npm run dev`

## Redis
* Monitor commands issued to Redis during dev/debugging `npm run start-rediscli` > `MONITOR`

# VS Code config examples
```JSON
{
	"version": "0.2.0",
	"configurations": [
		{
			"type": "node",
			"request": "launch",
			"name": "Debug GraphQL appGraphql - redis",
			"skipFiles": [
				"<node_internals>/**"
			],
			"program": "${workspaceFolder}/bin/wwwgql",
			"env": {
				"DEBUG": "sim",
				"SIM_APP": "appGraphql",
				"SIM_DATASOURCE": "redis"
			}
		},
		{
			"type": "node",
			"request": "launch",
			"name": "Debug REST app - redis",
			"skipFiles": [
				"<node_internals>/**"
			],
			"program": "${workspaceFolder}/bin/www",
			"env": {
				"DEBUG": "sim",
				"SIM_DATASOURCE": "redis"
			}
		},
		{
			"type": "node",
			"request": "launch",
			"name": "Debug REST app - firebase",
			"skipFiles": [
				"<node_internals>/**"
			],
			"program": "${workspaceFolder}/bin/www",
			"env": {
				"DEBUG": "sim",
				"SIM_DATASOURCE": "firebase",
				"SIM_FIREBASE": "YOUR_FIREBASE_ENDPOINT",
			}
		},
		{
			"type": "node",
			"request": "launch",
			"name": "Debug AVA test - NB. Needs latest nodejs 10, 12 or 13",
			"program": "${workspaceFolder}/node_modules/.bin/ava",
			"args": [
				"debug",
				"--break",
				"--verbose",
				"--fail-fast",
				"${file}"
			],
			"port": 9229,
			"outputCapture": "std",
			"skipFiles": [
				"<node_internals>/**/*.js"
			],
			"env": {
				"DEBUG": "sim",
				"SIM_DATASOURCE": "redis",
				"SIM_STUB_DATASOURCE": "1",
				"SIM_GQL_PATH": "/.netlify/api/graphql"
			}
		}
	]
}
```