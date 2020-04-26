const { isValidUser } = require('../datasource/utils');
const { UserInputError } = require('apollo-server-express');
const { DataNotFoundError } = require('../datasource/DatasourceErrors');

exports.resolvers = {
	Query: {
		user: async (parent, { name }, context, info) => {
			try {
				const userResult = await context.datasource.get({ name });
				return userResult;
			} catch (er) {
				if (er instanceof DataNotFoundError) {
					throw new UserInputError(`User "${er.input}" was not found.`);
				}
			}
		},
		userList: async (parent, { name }, context, info) => {
			try {
				const users = await context.datasource.getUsers({ name });
				return users;
			} catch (er) {
				if (er instanceof DataNotFoundError) {
					throw new UserInputError(`No users with name "${er.input}" were found`);
				}
			}
		}
	},
	Mutation: {
		createUser: async (p, { name, email, address, role }, c, i) => {
			try {
				const user = { name, email, address, role };
				if (!isValidUser(user)) {
					throw new Error('Could not create user with args: ' + JSON.stringify(user))
				}

				const { id } = await c.datasource.add({ name, email, address, role });
				return {
					success: true,
					msg: 'Created user',
					user: { id, name, email, address, role  },
				};
			} catch(er) {
				return {
					success: false,
					msg: er.message,
				};
			}
		},
		removeUser: async (p, { id }, c, i) => {
			try {
				await c.datasource.remove(id);
				return {
					success: true,
					msg: 'Removed user',
					id: id,
				};
			} catch (er) {
				return {
					success: false,
					msg: er.message,
				};
			}
		}
	}
};
