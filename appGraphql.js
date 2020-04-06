const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./typeDefs.js');
const { resolvers } = require('./resolvers');
const datasource = require(`./datasource/redis`);

const app = express();
new ApolloServer({
	typeDefs,
	resolvers,
	context: (req, res) => ({
		datasource
	}),
})
.applyMiddleware({ app });

module.exports = app;