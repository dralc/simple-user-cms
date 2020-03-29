# SimpleUserCMS

- This server provides endpoints for interacting with a Firebase or Redis db.

## Environment variables
* DEBUG=sim
* SIM_DATASOURCE=redis OR firebase

### For a datasource of `redis`
* SIM_REDIS_HOST _(defaults to localhost)_
* SIM_REDIS_PORT _(defaults to 6379)_

### For a datasource of `firebase`
* SIM_FIREBASE=https://your-firebase-endpoint.com
