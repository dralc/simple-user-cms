require('../types');
var express = require('express');
var router = express.Router();
let _datasource;

/* 
* Adds a new user
*/
router.post('/add', async (req, res) => {
	if ( !isValidUser(req.body) ) {
		res.status(400)
			.send('invalid user data');
		return;
	}

	const user = normalize(req.body);
	const addedUser = await _datasource.add(user);
	res.status(201)
		.send(addedUser);
});

/*
 * Remove a user
 */
router.delete('/remove', async (req, res) => {
	const id = req.body.id;
	const msg = await _datasource.remove(id);
	res.send(msg);
});

/*
* Search a user by name
*/
router.get('/get', async (req, res) => {
	try {
		const name = req.query.name;
		const user = await _datasource.get({ name });
		res.set('Content-type', 'application/json')
		res.send(JSON.stringify(user));
	} catch (er) {
		res.send( { message: `${er.name}: User "${er.input}" not found` } );
	}
});

/**
 * Clean/format client submitted data
 * @param {User} user
 */
function normalize(user) {
	return {  
		...user,
	};
}

/**
 * @param {User} user 
 */
function isValidUser(user) {
	return !!(user.name &&
		user.email &&
		user.address &&
		(/^(true|false)$/i.test(user.role))
	);
}

module.exports = (datasource) => {
	_datasource = datasource;

	return router;
}
