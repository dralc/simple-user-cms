<script>
	import { request } from 'graphql-request';

	const hasData = false;
	const SERVER_URL = '/api/graphql'
	const QUERY_user = `
	query ($name: String) {
		userList(name: $name) {
			id
			name
			address
			email
			role
		}
	}`;

	let search;
	let nameToFind;

	$: if (nameToFind) {
		search = request(SERVER_URL, QUERY_user, { name: nameToFind });
	}

	const clean = str => str.replace(/: {"response.+/, '');
	
</script>

<main>
	<input type="text" bind:value={nameToFind} />
	{#await search}
		<p>...</p>
	{:then res}
		{#if res}
			<table id="sugg">
				{#each res.userList as user}
					<tr><td>{user.name}, {user.address}</td></tr>
				{/each}
			</table>
		{/if}
	{:catch er}
		<p>{ clean(er.message) }</p>
	{/await}
</main>

<style>
	#sugg {
		border: #ccc solid 1px;
		border-radius: 10px;
	}
</style>