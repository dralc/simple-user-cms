const datasource = require('../datasource/redis');
const faker = require('faker');
faker.locale = "en_AU";

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

addUsers(50);