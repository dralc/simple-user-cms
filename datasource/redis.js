/*---------------------------------------------------------------------------
# Redis db design
	Key                    | Type     | Value
	---                    | ---      | ---
	nextUserId             | number   | auto inc
	user:{nextUserId}      | HashMap  | User -> name, email, address, role
	nameIndex              | HashMap  | {User.name}:{User.nextUserId} -> {nextUserId}
----------------------------------------------------------------------------*/
const INDEX_NAME = 'nameIndex';
const USER_PREFIX = 'user:';
const SCAN_COUNT = 1000;
require ('../types');
const Redis = require('ioredis');
const debug = require('debug');
const { DataNotFoundError } = require('./DatasourceErrors');

debug('sim');

let redis;
if ( !process.env.SIM_STUB_DATASOURCE ) {
	redis = new Redis({
		port: process.env.SIM_REDIS_PORT || 6379,
		host: process.env.SIM_REDIS_HOST || 'localhost',
		password: process.env.SIM_REDIS_AUTH || '',
	});
}

const { arrayToObject } = require('./utils');
const { getUsersByName_lua } = require('./lua/user');

/*
 Load Lua scripts
*/
redis.defineCommand('getUsersByName', {
	numberOfKeys: 1,
	lua: getUsersByName_lua,
});

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

		await redis.multi()
			.hset(userKey, 'name', user.name, 'email', user.email, 'address', user.address, 'role', user.role)
			.hset(INDEX_NAME, `${user.name.toLowerCase()}:${nextUserId}`, nextUserId)
			.exec();

		return { id: nextUserId };

	} catch (er) {
		throw er;
	}
}

/**
 * @param {String} id - The user id
 * @returns {Promise<String>}
 */
exports.remove = async id => {
	try {
		// Remove user from the name index
		const name = await redis.hget(USER_PREFIX + id, 'name');
		const num1 = await redis.hdel(INDEX_NAME, `${name.toLowerCase()}:${id}`);

		// Remove user
		const numKeysDel = await redis.del(`${USER_PREFIX}${id}`);
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
	let users;

	users = await this.getUsers({ name, first: 1 });

	return users[0];
}

/**
 * Gets a list of users with the matching `name`
 * 
 * @param { {name: String, first: Number} } arg
 * @returns {Promise<Array<UserResult>}
 * @throws {DataNotFoundError}
 */
exports.getUsers = async ({ name, first }) => {
	if (!name || (typeof name !== 'string')) {
		throw Error("You must specify a valid 'name' param");
	}
	if (!first || (typeof first !== 'number')) {
		throw Error("You must specify a valid 'first' param");
	}

	const users = await redis.getUsersByName(INDEX_NAME, name.toLowerCase(), SCAN_COUNT, first, USER_PREFIX);

	if (!users) {
		throw new DataNotFoundError( { input: name }, 'Data not found' );
	}

	const ret = [];
	for (let user of users) {
		ret.push( normalizeUser(arrayToObject(user)) );
	}

	return ret;
}

function normalizeUser(user) {
	user.role = user.role === 'true' ? true : false;
	return user;
}