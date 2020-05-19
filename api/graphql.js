const { factory } = require('../graphql/appGraphql');
const serverlessHttp = require('serverless-http');
const app = factory();
const handler = serverlessHttp(app);

module.exports = async (req, res) => {

	// Build event object for this particular case
	// Supports GET and POST requests
	const isGet = /GET/.test(req.method);
	let body = !isGet ? JSON.stringify(req.body) : undefined;
	let queryStringParameters = isGet ? req.query : undefined;

	const event = {
		headers: { 'Content-Type': 'application/json'},
		httpMethod: req.method,
		isBase64Encoded: false,
		path: '/api/graphql',
		body,
		queryStringParameters,
	};
	
	const result = await handler(event);

	res.setHeader('cache-control', 'public, max-age=60');
	res.send(result.body);
}
