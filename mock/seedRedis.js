/**
 * Usage 
 * 1. > node mock/seedRedis $count
 * 2. > node mock/seedRedis fixturesPath/my.json
 */

const datasource = require('../datasource/redis');
const faker = require('faker');
faker.locale = "en_AU";
const userArg = process.argv[2];
const fs = require('fs');
const path = require('path');

if (Number.isInteger(parseInt(userArg))) {
	addUsers(userArg);
} else {
	addUsersFromFile(userArg);
}

async function addUsersFromFile(filePath) {
	fs.readFile(path.join('.', filePath), async (er, dat) => {
		if (er) {
			throw er;
		}

		const ar = JSON.parse(dat.toString());
		const addedUsers = [];
		for (let user of ar) {
			addedUsers.push(datasource.add(user));
		}

		await Promise.all(addedUsers);

		console.log(`Added ${ar.length} users`);
		process.exit(0);
	});
}

async function addUsers(count) {
	const addedUsers = [];
	for(let i=0; i<count; i++) {
		let user = {
			name: faker.name.findName(),
			email: faker.internet.exampleEmail(),
			address: faker.fake('{{address.streetAddress}}, {{address.city}} {{address.zipCode}}'),
			role: faker.random.boolean()
		};
		
		addedUsers.push(datasource.add(user));
	}

	await Promise.all(addedUsers);

	console.log(`Added ${count} users`);
	process.exit(0);
};
