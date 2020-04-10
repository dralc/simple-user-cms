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
const { DataNotFoundError } = require('./DatasourceErrors');

debug('sim');

let redis;
if ( !process.env.SIM_STUB_DATASOURCE ) {
	redis = new Redis(
			process.env.SIM_REDIS_PORT || 6379,
			process.env.SIM_REDIS_HOST || 'localhost');
}

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

		redis.hset(INDEX_NAME, user.name.toLowerCase(), nextUserId);

		return { id: userKey };

	} catch (er) {
		debug.log(er);
		throw er;
	}
}

/**
 * @param {String} id - The userKey
 * @returns {Promise<String>}
 */
exports.remove = async id => {
	try {
		// Remove user from the name index
		const name = await redis.hget(id, 'name');
		const num1 = await redis.hdel(INDEX_NAME, name.toLowerCase());

		// Remove user
		const numKeysDel = await redis.del(id);
		if (num1 === 0 && numKeysDel === 0) {
			throw Error(`User ${id} was not found. Nothing was removed`);
		}

		return `Removed ${id}`;

	} catch (er) {
		debug.log(er);
		throw er;
	}
}

/**
 * Gets the first matching user with a name specified by `name`
 *
 * @param { {id: String, name: String} } arg
 * @returns {Promise<UserResult>}
 */
exports.get = async ({ id, name }) => {
	const matches = await redis.hscan(INDEX_NAME, 0, 'MATCH', `*${name.toLowerCase()}*`);

	if (matches[1].length === 0) {
		throw new DataNotFoundError( { input: id || name }, 'Data not found' );
	}

	const userKey = `${USER_PREFIX}${matches[1][1]}`;
	const user = await redis.hgetall(userKey);
	normalizeUser(user);

	return { ...{ id: userKey }, ...user };
}

/**
 * @returns {Promise<Array<UserResult>}
 */
exports.getUsers = async ({ name }) => {
	const matches = await redis.hscan(INDEX_NAME, 0, 'MATCH', `*${name.toLowerCase()}*`);
	const matchedUsers = matches[1]; // Format ['John Doe', '11', 'Bob Scott ', '51']

	if (matchedUsers.length === 0) {
		return [];
	}

	// Get matched users from index
	// Format [ { id:'user:11' }, { id:'user:51' } ]
	const userResults = matchedUsers.reduce((acc, val, i) => {
		// user num is in the odd indices
		if (i % 2 !== 0) {
			acc.push({ id: `${USER_PREFIX}${val}` });
		}
		return acc;
	}, []);

	// Look up each user and fill in user data
	let userGot;
	for (let user, i=0, len=userResults.length; i < len; i++) {
		user = userResults[i];
		// TODO use redis pipelining, https://github.com/luin/ioredis#pipelining
		// use a callback on each hgetall() to merge in `id` field
		userGot = await redis.hgetall(`${user.id}`);
		normalizeUser(userGot);
		userResults[i] = { ...user, ...userGot };
	}

	return userResults;
}

function normalizeUser(user) {
	user.role = user.role === 'true' ? true : false;
}