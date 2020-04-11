const { gql } = require('apollo-server-express');

exports.typeDefs = gql`
    type Query {
        user(id: String
             name: String) : User!
        userList(name: String) : [User!]!

    }
    type Mutation {
        createUser(name: String!
                   email: String!
                   address: String!
                   role: Boolean!) : CreateUserPayload!

        removeUser(id: ID!) : RemoveUserPayload!

    }
    type CreateUserPayload {
        success: Boolean!
        msg: String!
        user: User
    }
    type RemoveUserPayload {
        success: Boolean!
        msg: String!
        id: ID
    }
    type User {
        id: ID!
        name: String!
        address: String!
        email: String!
        role: Boolean!
    }
    # interface INode {
    #     # Unique id of an object
    #     id: ID!
    # }
    # interface IMutationPayload {
    #     success: Boolean!
    #     msg: String!
    # }
`