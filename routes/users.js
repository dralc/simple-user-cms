var express = require('express');
var router = express.Router();
let fetch = require('node-fetch');
let endpoint = process.env.FB_ENDPOINT;

/* 
  Adds a new user
*/
router.post('/add', (req, res) => {
  if ( !isValidUser(req.body) ) {
    res.send('invalid user data');
    return;
  }

  const user = normalize(req.body);

  fetch(`${endpoint}.json`, {
    method: 'post',
    body: JSON.stringify(user),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(json => res.send(json));
});

/*
 * Remove a user
 */
router.delete('/delete', (req, res) => {
  const id = req.body.id;

  fetch(`${endpoint}/${id}.json`, {
    method: 'delete',
  });
});

/*
* Search a user by name
*/
router.get('/get', (req, res) => {
  const name = req.query.name;

  fetch(`${endpoint}.json?orderBy="name"&startAt="${name}"&endAt="${name}\\uf8ff"`, {
    method: 'get',
  })
  .then(res => res.json())
  .then(json => res.send(json));
});

/**
 * @typedef {Object} User
 * @property {String} name
 * @property {String} email
 * @property {String} address
 * @property {Boolean} role
 */

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
