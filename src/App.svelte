<script>
	import createAuth0Client from "@auth0/auth0-spa-js";
	import Search from './Search.svelte';
	import AddUser from './AddUser.svelte';
	import Login from './Login.svelte';

	let auth0Client;
	let isAuth;
	let user;
	$: authDelete = user && (user['https://sim/role'] === 'admin');
	
	async function onWinLoad() {
		auth0Client = await createAuth0Client({
			domain: "simple-user-cms.au.auth0.com",
			client_id: "ztaoOWSlSNZ0PFK4ec14VGqlJrg7hIEV",
			redirect_uri: window.location.origin,
		});

		isAuth = await auth0Client.isAuthenticated();
		
		if (isAuth) {
			console.log('*** isAuth:', isAuth);
			user = await auth0Client.getUser();
		}
		else {
			const query = window.location.search;
			const shouldParseResult = query.includes("code=") && query.includes("state=");
			
			if(shouldParseResult) {
				try {
					const redirectResult = await auth0Client.handleRedirectCallback();
					isAuth = true;
					user = await auth0Client.getUser();
				}
				catch(er) {
					console.error(er);
				}
				window.history.replaceState({}, document.title, "/");
			}
		}
	}
</script>

<svelte:window on:load="{ onWinLoad }" />

<header>
	<h1>Simple User CMS</h1>
	<Login {isAuth} {user} {auth0Client} />
</header>

<main>
	<Search {authDelete} />
	<AddUser />
</main>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}
</style>