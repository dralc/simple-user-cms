<script>
	import { callGql, showError } from './utils.ts';

	const SERVER_URL = '/api/graphql'
	const QUERY =
	`query ($name: String) {
		userList(name: $name) {
			id name address email role
		}
	}`;

	let nameToFind;
	let userList;

	async function search(name) {
		if (! (name && name.length > 2) ) {
			return;
		}

		let res = await callGql(SERVER_URL, QUERY, { name });

		if (res && res.data) {
			// Only show X num of users
			userList = res.data.userList.slice(0, 10);
		}

		return res;
	}
</script>

<input type="text" bind:value={nameToFind} name="user" placeholder="search user"/>
{#await search(nameToFind)}
	<p>...</p>
{:then res}
	{#if res}
		<table id="sugg">
			<tbody>
			{#each userList as user}
				<tr>
					<td data-id={user.id}>{user.name}</td>
					<td>
						<a href="mailto:{user.email}">{user.email}</a> {user.address}
					</td>
					<td class="role">
						{#if user.role}
							<svg width="32" height="32" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1671 566q0 40-28 68l-724 724-136 136q-28 28-68 28t-68-28l-136-136-362-362q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68 28l136 136q28 28 28 68z"/></svg>
						{/if}
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	{/if}
{:catch er}
	<p>{ showError(er) }</p>
{/await}

<style>
	#sugg {
		box-shadow: 5px 5px 10px 0px rgba(0,0,0,0.1);
	}

	.role > svg {
		color: #0ca678;
		width: 1em;
	}
</style>