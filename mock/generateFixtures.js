/**
 * Writes fixture file to `fixtures/users.json`
 * Usage:
 * 1. > node generateFixtures 500
 */

const fs = require('fs');
const path = require('path');
const faker = require('faker');
faker.locale = "en_AU";

function run(count) {
	const ar = [];
	for (let i=0 ; i<count ; i++) {
		ar.push({
			name: faker.name.findName(),
			email: faker.internet.exampleEmail(),
			address: faker.fake('{{address.streetAddress}}, {{address.city}} {{address.zipCode}}'),
			role: faker.random.boolean()
		});
	}
	return ar;
}

let userCount = process.argv[2];
let ar = run(userCount);
fs.writeFile(path.join(__dirname, '../', 'fixtures', 'users.json'), JSON.stringify(ar), (er) => {
	if (er) throw er;
	console.log(`Created ${userCount} users`);
});
