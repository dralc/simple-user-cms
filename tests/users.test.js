const test = require('ava');
const http = require('http');
const app = require('../app');
const testListen = require('test-listen');
const fetch = require('node-fetch');

test.before(async t => {
	t.context.server = http.createServer(app);
	t.context.serverUrl = await testListen(t.context.server);
});

test.after.always(t => {
	t.context.server.close();
});

test('Adding a user', async t => {
	const user = {
		name: 'John',
		email: 'john@email.com',
		address: '3 jump st, sydney',
		role: "false"
	}; // todo generate random values
	const url = t.context.serverUrl + '/users/add/';
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user),
	});
	
	t.is(res.status, 200);

	try {
		let json = await res.json();
		t.truthy(json.name, 'Property <name> should be returned');
	} catch(er) {
		t.log(er);
	}
});
