require('../types');
const fetch = require('node-fetch');
const endpoint = process.env.SIM_FIREBASE;

/**
 * @param {User} user
 * @returns {Promise<AddedUser>
 */
exports.add = async user => {
	const res = await fetch(`${endpoint}.json`, {
		method: 'post',
		body: JSON.stringify(user),
		headers: { 'Content-Type': 'application/json' },
	});

	const addedUser = await res.json();
	const id = addedUser.name;

	return { id };
}

/**
 * @param {String} id
 * @returns {String}
 */
exports.delete = async id => {
	await fetch(`${endpoint}/${id}.json`, {
		method: 'delete',
	});

	return 'ok';
}

/**
* @param {String} name 
* @returns {Promise<ResultsUsers>}
 */
exports.get = async name => {
	const res = await fetch(`${endpoint}.json?orderBy="name"&startAt="${name}"&endAt="${name}\\uf8ff"`, {
		method: 'get',
	});

	return res.json() || {};
}
