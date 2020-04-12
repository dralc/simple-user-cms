import { request } from 'graphql-request';
import avaTest, { TestInterface } from 'ava';  // NB. ava 3.x needs latest nodejs 10, 12, 13
import * as http from 'http';
import sinon from 'sinon';
import factory from '../appGraphql';
import { DataNotFoundError } from '../datasource/DatasourceErrors';
import { hasSameProps } from '../utils';
import { QUERY_user, QUERY_userList, MUTATION_createUser } from "./gqlQueries";
import { ValidationError } from "./errors";

const testListen = require('test-listen');
const test = avaTest as TestInterface<{ testProps, ds_get, ds_getUsers, server, serverUrl:string }>;
let isStubDatasource = !!process.env.SIM_STUB_DATASOURCE;

function stubApp(ctx) {
	const users = require('../fixtures/users.json');
	const id = 'maddisonsId';
	const id2 = 'maddissonsId2';
	const badName = ctx.testProps.badName;
	const goodName = ctx.testProps.goodName;

	const fake_ds = {
		get: sinon.stub(),
		getUsers: sinon.stub(),
		add: sinon.stub()
			.withArgs( ctx.testProps.validUser )
			.resolves( { id: ctx.testProps.validUserId } ),
	};

	fake_ds.get
		.withArgs({ name: badName })
		.throws(new DataNotFoundError( { input: badName } ));
	fake_ds.get
		.withArgs({ name: goodName })
		.resolves( { id, ...users[3] } );
	
	fake_ds.getUsers
		.withArgs( { name: badName } )
		.throws(new DataNotFoundError( { input: badName } ));
	fake_ds.getUsers
		.withArgs( { name: goodName } )
		.resolves( [ { id, ...users[3] }, { id: id2, ...users[332] } ] );

	// fake_ds.add
	// 	.withArgs( ctx.testProps.validUser )
	// 	.resolves( { id: ctx.test.validUserId } )

	return factory(fake_ds);
}

test.beforeEach(async t => {
	t.context.testProps = {
		badName: 'bad name here',
		goodName: 'Maddison',
		validUserId: 'userId',
		validUser: {
			name: 'Alverta Lang',
			address: '51405 Zemlak Viaduct, Lake Alex 08214',
			email: 'Tillman.Rice@yahoo.com',
			role: true,
		},
	};	

	// Instrument graphql server
	let app;
	if (isStubDatasource) {
		app = stubApp(t.context);
	} else {
		app = factory();
	}

	t.context.server = http.createServer(app);
	const serverUrl = await testListen(t.context.server);
	t.context.serverUrl = `${serverUrl}/graphql`;
});

test.afterEach.always(t => {
	sinon.restore();
	t.context.server.close();
});

test('Get a user', async t => {
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

test('Get a list of users', async t => {
	try {
		const ctx = t.context;

		// Test an invalid 'name'
		let err = await t.throwsAsync(() => {
			return request(ctx.serverUrl, QUERY_userList, { name: ctx.testProps.badName } )
		}, null, 'should have thrown bad input error');

		t.is(err['response'].errors[0].extensions.code, 'BAD_USER_INPUT');
		
		// Test a valid 'name'
		const users = await request(ctx.serverUrl, QUERY_userList, { name: ctx.testProps.goodName } );
		t.is(users.userList.length, 2 );
		t.true(hasSameProps( users.userList[0], { id:'',name:'',email:'',address:'',role:'' } ));
	}
	catch (er) {
		console.error(JSON.stringify(er, null, 2));
		throw er;
	}
});

test('Create a user: invalid user', async t => {
	try {

		const ctx = t.context;
		const invalidUser = { /* no input fields specified */ };
		let res = await t.throwsAsync( () => {
			return request(ctx.serverUrl, MUTATION_createUser, invalidUser);
		}, null, 'should have thrown validation error') as ValidationError;
		
		t.is(res.response.errors.length, 4, 'should have the right no. of validation errors');
	}
	catch (er) {
		console.error(JSON.stringify(er, null, 2));
	}
});

test('Create a user: valid user', async t => {
	try {
		const ctx = t.context;
		const validUser = ctx.testProps.validUser;
		let res = await request(ctx.serverUrl, MUTATION_createUser, validUser);
		t.true(res.createUser.success);
		t.true(hasSameProps(res.createUser.user, { id:'', name:'', email:'', address:'', role:'' }));
	}
	catch (er) {
		console.error(JSON.stringify(er, null, 2));
	}
});