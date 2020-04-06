const { gql } = require('apollo-server-express');

exports.typeDefs = gql`
	type Query {
		user(id: String, name: String): User
		# userList: [User!]!
	}
	type User {
		id: ID!
		name: String!
		address: String!
		email: String!
		role: Boolean!
	}
`