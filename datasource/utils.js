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

/**
 * Transforms an array [ a, b, c, d ] into an object { a: b, c: d}
 * @param {Array} ar
 * @returns {Object | null}
 */
exports.arrayToObject = (ar) => {
	if (Array.isArray(ar)) {
		const obj = {};
		for (let i = 0; i < ar.length; i += 2) {
			obj[ar[i]] = ar[i + 1];
		}
		return obj;
	}
	return null;
}