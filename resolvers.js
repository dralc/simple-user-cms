exports.resolvers = {
	Query: {
		user: async (parent, { name }, context, info) => {
			const userResult = await context.datasource.get({ name });
			return userResult;
		},
	},
};
