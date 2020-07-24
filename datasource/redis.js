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
const SCAN_COUNT = 10000;
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

const fs = require('fs');
const path = require('path');
const { arrayToObject } = require('./utils');

/*
 Load Lua scripts
*/
const getUserReady = new Promise((reso, rej) => {
	fs.readFile(path.join(__dirname, 'lua/getUser.lua'), { encoding: 'utf8' }, (er, getUser_lua) => {
		if (er) {
			rej(er.message);
		}
		redis.defineCommand('getUser', {
			numberOfKeys: 1,
			lua: getUser_lua
		});
		reso(1);
	});
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
		await redis.hset(userKey,
			'name', user.name,
			'email', user.email,
			'address', user.address,
			'role', user.role);

		await redis.hset(INDEX_NAME, user.name.toLowerCase(), nextUserId);

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
	await getUserReady;
	let user = await redis.getUser(INDEX_NAME, name.toLowerCase(), 500, 1);

	if (!user) {
		throw new DataNotFoundError( { input: id || name }, 'Data not found' );
	}

	user = arrayToObject(user);
	normalizeUser(user);

	return user;
}

/**
 * Gets a list of users with the matching `name`
 * 
 * @param { {name: String, first: Number} } arg
 * @returns {Promise<Array<UserResult>}
 */
exports.getUsers = async ({ name, first }) => {
	const indexScan = new Promise((res, rej) => {
		const stream = redis.hscanStream(INDEX_NAME, { match: `*${name.toLowerCase()}*`, count: SCAN_COUNT});
		let allUsers = [];
		stream.on('data', users => {
			allUsers = [...allUsers, ...users];
			if( first && allUsers.length >= (first * 2) ) {
				stream.destroy();
				res(allUsers);
			}
		});
		stream.on('end', () => res(allUsers));
	});

	// Format ['John Doe', '11', 'Bob Scott ', '51']
	let matchedUsers = await indexScan;

	if (matchedUsers.length === 0) {
		throw new DataNotFoundError( { input: name }, 'Data not found' );
	}

	// Get matched users from index
	// Format [ { id:'user:11' }, { id:'user:51' } ]
	matchedUsers = matchedUsers.slice(0, first * 2);
	const userResults = matchedUsers.reduce((acc, val, i) => {
		// user num is in the odd indices
		if (i % 2 !== 0) {
			acc.push({ id: `${USER_PREFIX}${val}` });
		}
		return acc;
	}, []);

	// Look up each user and fill in user data
	let pipe = redis.pipeline();
	for (let user, i=0, len=userResults.length; i < len; i++) {
		user = userResults[i];
		pipe.hgetall(`${user.id}`, (er, userGot) => {
			normalizeUser(userGot);
			userResults[i] = { ...user, ...userGot };
		});
	}

	await pipe.exec();

	return userResults;
}

function normalizeUser(user) {
	user.role = user.role === 'true' ? true : false;
}