/**
 * @param {User} user 
 */
exports.isValidUser = (user) => {
	return !!(user.name &&
		user.email &&
		user.address &&
		(/^(true|false)$/i.test(user.role))
	);
}
