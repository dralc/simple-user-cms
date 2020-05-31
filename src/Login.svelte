<script>
  import { onMount } from "svelte";

  export let auth0Client;
  export let isAuth;
  let profile;

  async function login() {
    try {
      await auth0Client.loginWithRedirect();
    } catch (er) {
      console.error(er);
    }
  }

  async function logout() {
    try {
      await auth0Client.logout();
    } catch (er) {
      console.error(er);
    }
  }
</script>

<style>
  button { display:none; }
  .show { display: block; }
</style>

<div>
  <button class:show={!isAuth} on:click={login}>Log in</button>
  <button class:show={isAuth} on:click={logout}>Log out</button>

  <div class="profile">
    <!-- <p>{profile}</p> -->
  </div>
</div>
