require('../types');
var express = require('express');
var router = express.Router();

/** @type {Datasource}*/
let datasource = require(`../datasource/${process.env.SIM_DATASOURCE}`);

/* 
* Adds a new user
*/
router.post('/add', async (req, res) => {
	if ( !isValidUser(req.body) ) {
		res.send('invalid user data');
		return;
	}

	const user = normalize(req.body);
	const addedUser = await datasource.add(user);
	res.send(addedUser);
});

/*
 * Remove a user
 */
router.delete('/delete', async (req, res) => {
	const id = req.body.id;
	await datasource.delete(id);
	res.send('deleted');
});

/*
* Search a user by name
*/
router.get('/get', async (req, res) => {
	const name = req.query.name;
	const user = await datasource.get(name);
	res.send(user);
});

/**
 * Clean/format client submitted data
 * @param {User} user
 */
function normalize(user) {
	return {  
		...user,
		...{ role: !!(user.role === 'true') }
	};
}

/**
 * @param {User} user 
 */
function isValidUser(user) {
	return !!(user.name && user.email && user.address && user.role);
}

module.exports = router;
