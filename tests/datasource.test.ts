import { getUsers } from '../datasource/redis';
import test from 'ava';

test('getUsers | N valid users', async t => {
	let users = await getUsers( { name: 'patrick', first: 1 });
	t.is(users.length, 1);

	users = await getUsers({ name: 'patrick', first: 3 })
	t.is(users.length, 3);

	users = await getUsers({ name: 'patrick', first: 6 })
	t.is(users.length, 6);
});