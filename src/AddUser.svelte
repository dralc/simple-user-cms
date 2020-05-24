<script>
	import { callGql, showError } from './utils.ts';
	import { fade } from 'svelte/transition';

	const SERVER_URL = '/api/graphql';
	const MUTATION_createUser =
	`mutation ($name:String!, $email:String!, $address:String!, $role:Boolean!){
		createUser(name: $name, email: $email, address: $address, role: $role) {
			success
			msg
			user {
				id name address email role
			}
		}
	}`;

	let name, address, email,
		role = false;
	
	$: invalidUser = !(
			name && name.trim() &&
			address && address.trim() &&
			email && email.trim() &&
			typeof role === 'boolean'
		);
	
	let addUser_prom;

	function addUser() {
		if ( invalidUser ) {
			return;
		}
		addUser_prom = callGql(SERVER_URL, MUTATION_createUser, { name, address, email, role });
	}

	let disableMsg;
	function hideMsg() {
		setTimeout(() => disableMsg = true, 3000);
	}
</script>

<fieldset>
	<legend>Add a user</legend>
	<label for="name">Name</label>
	<input bind:value={name} type="text" id="name" placeholder="John Doe">

	<label for="address">Address</label>
	<input bind:value={address} type="text" id="address" placeholder="21 Jump St">
	
	<label for="email">Email</label>
	<input bind:value={email} type="text" id="email" placeholder="jdoe@email.com">

	<p>
		<input bind:checked={role} type="checkbox" id="role">
		<label for="role">Administrator</label>
	</p>

	<button on:click={addUser} disabled={invalidUser}>Add</button>

	{#await addUser_prom}
		<p>...</p>
	{:then res}
		{#if res && res.data.createUser.success && !disableMsg}
			<mark transition:fade on:introend="{ hideMsg() }">
				User has been added
			</mark>
		{/if}
	{:catch er}
		<pre>{ showError(er) }</pre>
	{/await}
</fieldset>

<style>

</style>