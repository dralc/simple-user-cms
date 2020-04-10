import { request } from 'graphql-request';
import avaTest, { TestInterface } from 'ava';  // NB. ava 3.x needs latest nodejs 10, 12, 13
import * as http from 'http';
import sinon from 'sinon';
import { app, datasource } from '../appGraphql';
import { DataNotFoundError } from '../datasource/DatasourceErrors';

const testListen = require('test-listen');
const test = avaTest as TestInterface<{ ds_get, server, serverUrl:string }>;
let isStubDatasource = !!process.env.SIM_STUB_DATASOURCE;

const QUERY_user = `
query ($name: String) {
	user(name: $name) {
		id
	}
}
`;

test.beforeEach(async t => {
	// Instrument graphql server
	t.context.server = http.createServer(app);
	const serverUrl = await testListen(t.context.server);
	t.context.serverUrl = `${serverUrl}/graphql`;
	
	// Stub only when it's turned on
	if (isStubDatasource) {
		let ds_get = t.context.ds_get = sinon.stub(datasource, 'get');

		ds_get.withArgs({ name: 'bad name here' })
			.throws(new DataNotFoundError( { input: 'bad name here'} ));
		ds_get.withArgs({ name: 'sam' })
			.resolves({ id:'samsId' });
	}
});

test.afterEach.always(t => {
	sinon.restore();
	t.context.server.close();
});

test('Get a user', async t => {
	try {
		let err = await t.throwsAsync( () => {
			return request(t.context.serverUrl, QUERY_user, { name: 'bad name here' });
		}, null, 'did not throw bad input error');
		
		t.is(err['response'].errors[0].extensions.code, 'BAD_USER_INPUT');

		let payload = await request(t.context.serverUrl, QUERY_user, { name: 'sam' });
		t.truthy(payload.user.id, 'a user should have been found');
	}
	catch (error) {
		console.error(JSON.stringify(error, null, 2));
	}
});


// const QUERY_userList = `
// query ($name: String) {
// 	userList(name: $name) {
// 		id
// 		name
// 		email
// 		address
// 		role
// 	}
// }
// `;

// const MUTATION_createUser = `
// mutation ($name:String!, $email:String!, $address:String!, $role:Boolean!){
// 	createUser(name: $name, email: $email, address: $address, role: $role) {
// 		success
// 		msg
// 		user {
// 			id
// 			name
// 			address
// 			email
// 			role
// 		}
// 	}
// }
// `;

// const MUTATION_removeUser = `
// mutation {
// 	removeUser(id:"user:499") {
// 	  success
// 	  msg
// 	  id
// 	}
//   }
// `;