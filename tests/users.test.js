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
function addUser(serverUrl, user) {
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
function getUser(serverUrl, name) {
	return fetch(`${serverUrl}/users/get?name=${name}`);
}

/**
 * @param {String} serverUrl
 * @param {String} id - user's id
 */
function deleteUser(serverUrl, id) {
	return fetch(serverUrl + '/users/delete', {
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

test('Sequence: Add user, get user, delete user, get user', async t => {
	
	try {
		const res = await addUser(t.context.serverUrl, t.context.user);
		
		t.is(res.status, 201);

		const addedUser = await res.json();
		
		t.truthy(addedUser.id, 'Property <id> should be returned');

		const res2 = await getUser(t.context.serverUrl, t.context.user.name);
		const gotUser = await res2.json();
		const gotUserDat = gotUser[addedUser.id];

		t.deepEqual(gotUserDat, t.context.user, 'The added user should be the same as the retrieved user');

		await deleteUser(t.context.serverUrl, addedUser.id);

		const res3 = await getUser(t.context.serverUrl, t.context.user.name);
		const blank = await res3.json();
		
		t.is(Object.keys(blank).length, 0, 'The user should have been deleted')

	} catch(er) { t.log(er) }
});
