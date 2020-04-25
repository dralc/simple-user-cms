const serverlessHttp = require('serverless-http');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./typeDefs.js');
const { resolvers } = require('./resolvers');
/** @type {IDatasource}*/
const _datasource = require(`./datasource/${process.env.SIM_DATASOURCE}`);

/**
 * Factory for creating an express app with ApolloServer middleware
 * @param {IDatasource} ds - for injecting a fake datasource for testing
 * @returns {Express}
 */
function factory(ds=_datasource) {
	const app = express();
	new ApolloServer({
		typeDefs,
		resolvers,
		context: (req, res) => ({
			datasource: ds || _datasource
		}),
	})
	.applyMiddleware({
		app,
		path: `${process.env.SIM_GQL_PATH}`
	});

	return app;
}

module.exports.factory = factory;

module.exports.handler = async (event, context) => {
	const app = factory();
	const handler = serverlessHttp(app);
	const result = await handler(event, context);
	return result;
};
