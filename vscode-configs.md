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
			"name": "Debug AVA test",
			"program": "${workspaceFolder}/node_modules/.bin/ava",
			"args": [
				"--config", "${workspaceFolder}/ava.config.js",
				"${file}"
			],
			"outputCapture": "std",
			"skipFiles": [
				"<node_internals>/**/*.js"
			],
			"env": {
				"DEBUG": "sim",
				"SIM_DATASOURCE": "redis",
				"SIM_GQL_PATH": "/api/graphql"
			}
		}
	]
}
```