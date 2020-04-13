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

if (Number.isInteger(userArg)) {
	addUsers(userArg);
} else {
	addUsersFromFile(userArg);
}

async function addUsersFromFile(filePath) {
	fs.readFile(path.join('.', filePath), async (er, dat) => {
		if (er) {
			throw er;
		}

		let ar = JSON.parse(dat.toString());
		for (let user of ar) {
			await datasource.add(user);
		}

		console.log(`Added ${ar.length} users`);
		process.exit(0);
	});
}

async function addUsers(count) {
	for(let i=0; i<count; i++) {
		let user = {
			name: faker.name.findName(),
			email: faker.internet.exampleEmail(),
			address: faker.fake('{{address.streetAddress}}, {{address.city}} {{address.zipCode}}'),
			role: faker.random.boolean()
		};
		
		await datasource.add(user);
	}

	console.log(`Added ${count} users`);
	process.exit(0);
};
