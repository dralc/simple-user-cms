import { request } from 'graphql-request';
import avaTest, { TestInterface } from 'ava';  // NB. ava 3.x needs latest nodejs 10, 12, 13
import * as http from 'http';
import sinon from 'sinon';
import { app, datasource } from '../appGraphql';
import { DataNotFoundError } from '../datasource/DatasourceErrors';
import { hasSameProps } from '../utils';

const testListen = require('test-listen');
const test = avaTest as TestInterface<{ testProps, ds_get, ds_getUsers, server, serverUrl:string }>;
let isStubDatasource = !!process.env.SIM_STUB_DATASOURCE;

const QUERY_user = `
query ($name: String) {
	user(name: $name) {
		id
	}
}
`;

const QUERY_userList = `
query ($name: String) {
	userList(name: $name) {
		id
		name
		email
		address
		role
	}
}
`;

test.beforeEach(async t => {
	// Instrument graphql server
	t.context.server = http.createServer(app);
	const serverUrl = await testListen(t.context.server);
	t.context.serverUrl = `${serverUrl}/graphql`;
	t.context.testProps = {
		badName: 'bad name here',
		goodName: 'Maddison',
	};
	
	// Stub only when it's turned on
	if (isStubDatasource) {
		const users = require('../fixtures/users.json');
		const id = 'maddisonsId';
		const id2 = 'maddissonsId2';
		const badName = t.context.testProps.badName;
		const goodName = t.context.testProps.goodName;

		let ds_get = t.context.ds_get = sinon.stub(datasource, 'get');
		ds_get
			.withArgs({ name: badName })
			.throws(new DataNotFoundError( { input: badName } ));
		ds_get
			.withArgs({ name: goodName })
			.resolves( { id, ...users[3] } );
		
		let ds_getUsers = t.context.ds_getUsers = sinon.stub(datasource, 'getUsers');
		ds_getUsers
			.withArgs( { name: badName } )
			.throws(new DataNotFoundError( { input: badName } ))
		ds_getUsers
			.withArgs( { name: goodName } )
			.resolves( [ { id, ...users[3] }, { id: id2, ...users[332] } ] );
	}
});

test.afterEach.always(t => {
	sinon.restore();
	t.context.server.close();
});

test.serial('Get a user', async t => {
	try {
		const ctx = t.context;

		// Test an invalid 'name'
		let err = await t.throwsAsync( () => {
			return request(ctx.serverUrl, QUERY_user, { name: ctx.testProps.badName });
		}, null, 'should have thrown bad input error');
		t.is(err['response'].errors[0].extensions.code, 'BAD_USER_INPUT');

		// Test a valid 'name'
		let payload = await request(ctx.serverUrl, QUERY_user, { name: ctx.testProps.goodName });
		t.truthy(payload.user.id, 'a user should have been found');
	}
	catch (error) {
		console.error(JSON.stringify(error, null, 2));
	}
});

test.serial('Get a list of users', async t => {
	try {
		const ctx = t.context;

		// Test an invalid 'name'
		let err = await t.throwsAsync(() => {
			return request(ctx.serverUrl, QUERY_userList, { name: ctx.testProps.badName } )
		}, null, 'should have thrown bad input error');

		t.is(err['response'].errors[0].extensions.code, 'BAD_USER_INPUT');
		
		// Test a valid 'name'
		const users = await request(ctx.serverUrl, QUERY_userList, { name: ctx.testProps.goodName } );
		t.truthy(users.userList.length);
		t.true(hasSameProps( users.userList[0], { id:'',name:'',email:'',address:'',role:'' } ));
	}
	catch (er) {
		console.error(JSON.stringify(er, null, 2));
		throw er;
	}
});

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