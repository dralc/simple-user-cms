import { getUsers } from '../datasource/redis';
import test from 'ava';
import { DataNotFoundError } from '../datasource/DatasourceErrors';

test('getUsers | invalid calls', async t => {
	let er = await t.throwsAsync( () => getUsers( { name: '' }) );
	t.is(er.message, 'You must specify a valid \'name\' param');

	er = await t.throwsAsync( () => getUsers({ name: 'patrick' }) );
	t.is(er.message, 'You must specify a valid \'first\' param');
});

test('getUsers | invalid user', async t => {
	let er = await t.throwsAsync(() => getUsers({ name: 'bad name', first: 1 }));
	t.truthy(er instanceof DataNotFoundError);
});

test('getUsers | N valid users', async t => {
	let users = await getUsers({ name: 'patrick', first: 1 });
	t.is(users.length, 1);

	users = await getUsers({ name: 'patrick', first: 3 })
	t.is(users.length, 3);

	users = await getUsers({ name: 'patrick', first: 6 })
	t.is(users.length, 6);
});