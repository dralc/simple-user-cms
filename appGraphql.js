const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./typeDefs.js');
const { resolvers } = require('./resolvers');
/** @type {IDatasource}*/
const datasource = require(`./datasource/${process.env.SIM_DATASOURCE}`);

const app = express();
new ApolloServer({
	typeDefs,
	resolvers,
	context: (req, res) => ({
		datasource
	}),
})
.applyMiddleware({ app });

module.exports = {
	app,
	datasource
}