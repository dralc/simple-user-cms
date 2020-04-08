const { isValidUser } = require('./datasource/utils');

exports.resolvers = {
	Query: {
		user: async (parent, { name }, context, info) => {
			const userResult = await context.datasource.get({ name });
			return userResult;
		},
		userList: async (parent, { name }, context, info) => {
			const users = await context.datasource.getUsers({ name });
			return users;
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
