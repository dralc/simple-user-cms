<script>
  import { onMount } from "svelte";

  export let auth0Client;
  export let isAuth;
  export let user = {};

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
  .ctn { display: flex; justify-content: space-between; width: 180px;}
  button { display:none; }
  .show { display: block; }
  .pic { border-radius: 50%; width: 50px; }
</style>

<div class="ctn">
  <div class="profile">
    <img class="pic" src={user.picture} alt="{user.name}" >
  </div>
  <button class:show={!isAuth} on:click={login}>Log in</button>
  <button class:show={isAuth} on:click={logout}>Log out</button>
</div>
