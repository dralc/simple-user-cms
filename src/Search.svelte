<script>
	import { callGql, showError } from './utils.ts';

	/**
	 * search input hint.
	 * @type {string}
	 */
	export let hint = 'search user';

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

	let authDelete = true;
	const MUTATION =
	`mutation ($id:ID!) {
		removeUser(id: $id) {
			success msg id
		}
	}`;
	
	let delUser_prom;

	/**
	 * @param {String} id - The user id to delete
	 * @param {Number} index - The userList item index to hide after successful delete
	 */
	async function deleteUser(id, index) {
		delUser_prom = await callGql(SERVER_URL, MUTATION, { id });

		if (delUser_prom.data.removeUser.success) {
			// Add a 'hide' property to userList item
			userList[index] = { ...userList[index], ...{ hide: true } };
		}
	}
</script>

<input type="text" bind:value={nameToFind} name="user" placeholder="{hint}"/>
{#await search(nameToFind)}
	<p>...</p>
{:then res}
	{#if res}
		<table id="sugg">
			<thead><th>name</th><th>email/address</th><th>admin</th></thead>
			<tbody>
			{#each userList as user, i}
				<tr class:hide={user.hide}>
					<td>
						{#if authDelete}
							<a class="delete" on:click|preventDefault={deleteUser(user.id, i)} href="#del">
								<svg width="32" height="32" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
							</a>
						{/if}
						{user.name}
					</td>
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
	.delete > svg {
		color: salmon;
		width: 1.2em;
		height: auto;
		vertical-align: text-top;
	}
	tr {
		transition: all 0.7s 0s ease;
	}
	tr.hide {
		opacity: 0.05;
		visibility: collapse;
	}
</style>