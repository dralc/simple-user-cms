const { factory } = require('../graphql/appGraphql');
const serverlessHttp = require('serverless-http');
const app = factory();
const handler = serverlessHttp(app);

module.exports = async (req, res) => {
	const event = {
		headers: { 'Content-Type': 'application/json'},
		httpMethod: 'POST',
		isBase64Encoded: false,
		path: '/api/graphql',
		body: JSON.stringify(req.body),
	};
	
	const result = await handler(event);

	res.json(JSON.parse(result.body));
}
