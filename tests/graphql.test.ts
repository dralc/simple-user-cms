import { request } from 'graphql-request';
import avaTest, { TestInterface } from 'ava';  // NB. ava 3.x needs latest nodejs 10, 12, 13
import * as http from 'http';
import sinon from 'sinon';
import { factory }from '../graphql/appGraphql';
import { DataNotFoundError } from '../datasource/DatasourceErrors';
import { hasSameProps, getFuncPerf } from '../utils';
import { QUERY_user, QUERY_userList, MUTATION_createUser, MUTATION_removeUser } from "./gqlQueries";
import { ValidationError } from "./errors";

const testListen = require('test-listen');
const test = avaTest as TestInterface<{ testProps, ds_get, ds_getUsers, server, serverUrl:string }>;
let isStubDatasource = !!process.env.SIM_STUB_DATASOURCE;

function stubApp(ctx) {
	const id = 'patrickId';
	const badName = ctx.testProps.badName;
	const goodName = ctx.testProps.goodName;
	const stubDs = {
		get: sinon.stub(),
		getUsers: sinon.stub(),
		add: sinon.stub(),
		remove: sinon.stub(),
	};

	stubDs.get.withArgs({ name: badName })
		.throws(new DataNotFoundError( { input: badName } ));
	stubDs.get.withArgs({ name: goodName })
		.resolves( { id, name:'', email:'', address:'', role:false } );
	
	stubDs.getUsers.withArgs( { name: badName } )
		.throws(new DataNotFoundError( { input: badName } ));
	stubDs.getUsers.withArgs( { name: goodName } )
		.resolves( (new Array(47)).fill( { id, name:'', email:'', address:'', role:false } ));

	stubDs.add.withArgs( ctx.testProps.validUser )
		.resolves( { id: ctx.testProps.validUserId } );

	stubDs.remove.withArgs( ctx.testProps.validUserId )
		.resolves(`Removed ${ctx.testProps.validUserId}`);

	return factory(stubDs);
}

test.beforeEach(async t => {
	t.context.testProps = {
		badName: 'bad name here',
		goodName: 'Patrick',
		validUserId: 'userId:987123',
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
	t.context.serverUrl = `${serverUrl}${process.env.SIM_GQL_PATH}`;
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
		t.fail(JSON.stringify(error, null, 2));
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
		t.is(users.userList.length, 47 );
		t.true(hasSameProps( users.userList[0], { id:'',name:'',email:'',address:'',role:'' } ));
	}
	catch (er) {
		t.fail(JSON.stringify(er, null, 2));
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
		t.fail(JSON.stringify(er, null, 2));
	}
});

test('Create a valid user, then remove it ', async t => {
	try {
		const ctx = t.context;
		const validUser = ctx.testProps.validUser;
		let res = await request(ctx.serverUrl, MUTATION_createUser, validUser);
		t.true(res.createUser.success);
		t.true(hasSameProps(res.createUser.user, { id:'', name:'', email:'', address:'', role:'' }));
		t.truthy(res.createUser.user.id);

		// Test removing the added user
		res = await request(ctx.serverUrl, MUTATION_removeUser, { id: res.createUser.user.id } );
		t.true(res.removeUser.success);
	}
	catch (er) {
		t.fail(JSON.stringify(er, null, 2));
	}
});

test('Response time - QUERY_userList', async t => {
	const pad = 20;
	const avg_time_max = { local: 52 + pad, ci: 50 + pad };

	let perf = await getFuncPerf(3, () => request(t.context.serverUrl, QUERY_userList, { name: 'Patrick' }));

	t.log('Users found    :', perf.response.userList.length);
	t.log('Durations (ms) :', perf.durations);
	t.log('Average (ms)   :', perf.avg);

	t.truthy(perf.avg < (process.env.CI ? avg_time_max.ci : avg_time_max.local), `Average (${perf.avg}) is too high`);
});
