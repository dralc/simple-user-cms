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
const { resolve } = require('path');
const { Writable, PassThrough } = require('stream');
const jsonStream = require('JSONStream');

if (Number.isInteger(parseInt(userArg))) {
	addUsers(userArg);
} else {
	addUsersFromFile(userArg);
}

async function addUsersFromFile(filePath) {
	const addedUsers = [];
	
	const log_pstr = new PassThrough({objectMode: true});
	log_pstr.on('finish', async () => {
		await Promise.all(addedUsers);
		console.log(`Added ${addedUsers.length} users`);
		process.exit(0);
	});

	fs.createReadStream( resolve(filePath) )
		.pipe(jsonStream.parse('*'))
		.pipe(log_pstr)
		.pipe(
			new Writable({
				objectMode: true,
				write(user, enc, cb) {
					addedUsers.push( datasource.add(user) );
					cb();
				}
			})
		)
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
