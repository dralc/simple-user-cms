/*---------------------------------------------------------------------------
# Redis db design
	Key                    | Type     | Value
	---                    | ---      | ---
	nextUserId             | number   | auto inc
	user:{nextUserId}      | HashMap  | User -> name, email, address, role
	nameIndex {User.name}  | HashMap  | {nextUserId}
----------------------------------------------------------------------------*/
const INDEX_NAME = 'nameIndex';
const USER_PREFIX = 'user:';
require ('../types');
const Redis = require('ioredis');
const debug = require('debug');

debug('sim');

const redis = new Redis(
		process.env.SIM_REDIS_PORT || 6379,
		process.env.SIM_REDIS_HOST || 'localhost');

/**
 * Adds a user and indexes the user's name search
 * 
 * @param {User} user
 * @returns {Promise<AddedUser>
 */
exports.add = async user => {
	try {
		const nextUserId = await redis.incr('nextUserId');
		const userKey = `${USER_PREFIX}${nextUserId}`;
		await redis.hset(userKey,
			'name', user.name,
			'email', user.email,
			'address', user.address,
			'role', user.role);

		redis.hset(INDEX_NAME, user.name, nextUserId);
		
		return { id: userKey };

	} catch (er) {
		debug(er);
	}
}

/**
 * @param {String} id - The userKey
 * @returns {Promise<String>}
 */
exports.remove = async id => {
	// Remove user from the name index
	const name = await redis.hget(id, 'name');
	await redis.hdel(INDEX_NAME, name);

	// Remove user
	await redis.del(id);

	return `Removed ${id}`;
}

/**
 * Gets the first matching user with a name specified by `name`
 * 
 * @param { {id: String, name: String} } arg
 * @returns {Promise<UserResult>}
 */
exports.get = async ({ id, name }) => { 
	const matches = await redis.hscan(INDEX_NAME, 0, 'MATCH', `*${name}*`);
	
	if (matches[1].length === 0) {
		return {};
	}

	const userKey = `${USER_PREFIX}${matches[1][1]}`;
	const user = await redis.hgetall(userKey);
	normalizeUser(user);

	return { ...{ id: userKey }, ...user };
}

function normalizeUser(user) {
	user.role = user.role === 'true' ? true : false;
}