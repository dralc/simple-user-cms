const test = require('ava'); // NB. ava 3.x needs latest nodejs 10, 12, 13
const http = require('http');
const app = require('../app');
const testListen = require('test-listen');
const fetch = require('node-fetch');
const faker = require('faker');
faker.locale = "en_AU";

/**
 * @param {String} serverUrl
 * @param {User} user
 * @returns {Promise<Response>}
 */
function usersAdd(serverUrl, user) {
	return fetch(`${serverUrl}/users/add`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user),
	});
}

/**
 * @param {String} serverUrl 
 * @param {String} name - User.name to search for
 * @returns {Promise<Response>}
 */
function usersGet(serverUrl, name) {
	return fetch(`${serverUrl}/users/get?name=${name}`);
}

/**
 * @param {String} serverUrl
 * @param {String} id - user's id
 */
function usersRemove(serverUrl, id) {
	return fetch(serverUrl + '/users/remove', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `id=${id}`
	});
}

test.beforeEach(async t => {
	// Instrument an API server
	t.context.server = http.createServer(app);
	t.context.serverUrl = await testListen(t.context.server);

	// TODO instrument a mock datasource server that returns mock responses
	
	// Mock a new user
	/** @type {User} */
	t.context.user = {
		name: faker.name.findName(),
		email: faker.internet.exampleEmail(),
		address: faker.fake('{{address.streetAddress}}, {{address.city}} {{address.zipCode}}'),
		role: faker.random.boolean()
	};
});

test.afterEach.always(t => {
	t.context.server.close();
});

test('Add invalid user', async t => {
	const res = await  usersAdd(t.context.serverUrl, { name: 'some body', role: false });
	t.is(res.status, 400, 'Should return invalid');
});

test('Sequence: Add user, get user, remove user, get user', async t => {
	// --- Add user ---
	
	const res = await usersAdd(t.context.serverUrl, t.context.user);
	t.is(res.status, 201);

	const addedUser = await res.json();
	t.truthy(addedUser.id, 'Property <id> should be returned');

	// --- Get user ---

	const res2 = await usersGet(t.context.serverUrl, t.context.user.name);
	const gotUser = await res2.json();
	delete gotUser.id;
	t.deepEqual(gotUser, t.context.user, 'The added user should be the same as the retrieved user');

	// --- Remove user ---

	await usersRemove(t.context.serverUrl, addedUser.id);

	// --- Get user ---

	const res3 = await usersGet(t.context.serverUrl, t.context.user.name);
	const blank = await res3.json();
	t.is(Object.keys(blank).length, 0, 'The user should have been deleted but was still retrievable');
});
