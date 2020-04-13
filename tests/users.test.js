require('../types');
const test = require('ava'); // NB. ava 3.x needs latest nodejs 10, 12, 13
const http = require('http');
const { app, datasource } = require('../app');
const testListen = require('test-listen');
const fetch = require('node-fetch');

const sinon = require('sinon');
const { DataNotFoundError } = require('../datasource/DatasourceErrors');
let isStubDatasource = !!process.env.SIM_STUB_DATASOURCE;

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

	// Get user from fixture
	t.context.users = require('../fixtures/users.json');
	t.context.user = t.context.users[1];
	let user = t.context.user;
	let id = 'user:1';

	if ( isStubDatasource ) {
		t.context.ds_get = sinon.stub(datasource, 'get');
		t.context.ds_add = sinon.stub(datasource, 'add');
		t.context.ds_remove = sinon.stub(datasource, 'remove');

		t.context.ds_get.withArgs( { name: user.name } )
			.resolves( { id, ...user } );

		t.context.ds_add.withArgs(user)
			.resolves( { id } );

		t.context.ds_remove.withArgs(id)
			.resolves(`Removed ${id}`)
	}

});

test.afterEach.always(t => {
	sinon.restore();
	t.context.server.close();
});

test.serial('Add invalid user', async t => {
	const res = await  usersAdd(t.context.serverUrl, { name: 'some body', role: false });
	t.is(res.status, 400, 'Should return invalid');
});

test.serial('Sequence: Add user, get user, remove user, get user', async t => {
	// --- Add user ---

	const res = await usersAdd(t.context.serverUrl, t.context.user);
	t.is(res.status, 201);

	const addedUser = await res.json();
	t.truthy(addedUser.id, 'Property <id> should be returned');

	// --- Get user ---

	const res2 = await usersGet(t.context.serverUrl, t.context.user.name);
	const userResult = await res2.json();
	t.is(userResult.name, t.context.user.name, 'The added user should be the same as the retrieved user');

	// --- Remove user ---

	await usersRemove(t.context.serverUrl, addedUser.id);

	// --- Get user ---
	if ( isStubDatasource ) {
		t.context.ds_get.withArgs( { name: t.context.user.name } )
			.throws(new DataNotFoundError( { input:'' } ))
	}

	const res3 = await usersGet(t.context.serverUrl, t.context.user.name);
	const er = await res3.json();
	t.regex(er.message, /DataNotFoundError/i, 'The deleted user should not be found');
});
