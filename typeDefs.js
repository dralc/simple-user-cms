const { gql } = require('apollo-server-express');

exports.typeDefs = gql`
	type Query {
		user(id: String, name: String): User
		userList(name: String): [User!]!
	}
	# todo mutation
	type User {
		id: ID!
		name: String!
		address: String!
		email: String!
		role: Boolean!
	}
`