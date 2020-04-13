export const QUERY_user = `
query ($name: String) {
	user(name: $name) {
		id
	}
}
`;

export const QUERY_userList = `
query ($name: String) {
	userList(name: $name) {
		id
		name
		email
		address
		role
	}
}
`;

export const MUTATION_createUser = `
mutation ($name:String!, $email:String!, $address:String!, $role:Boolean!){
	createUser(name: $name, email: $email, address: $address, role: $role) {
		success
		msg
		user {
			id
			name
			address
			email
			role
		}
	}
}
`;

export const MUTATION_removeUser = `
mutation ($id:ID!) {
	removeUser(id: $id) {
	  success
	  msg
	  id
	}
  }
`;