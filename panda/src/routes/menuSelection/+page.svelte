<script lang="ts">
    import Navbar from '$lib/navbar.svelte';
    

    //-------------- auth guard --------------
    import { authGuard } from '$lib/authGuard';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    onMount(() => {
    const session = $page.data.session;
    const employee = $page.data.employee;
    const currentPath = $page.url.pathname;

    const redirectData = authGuard(session, employee, currentPath);
    if (redirectData && redirectData.location !== currentPath) {
        goto(redirectData.location);
    }
    });
    //----------------------------------------

    // Navigation functions
    function navigateToCheckout() {
        goto('/menuboard');
    }

    function navigateToLogin() {
        goto('/menuboard2');
    }

</script>

<div class="menuboard">
    <Navbar></Navbar>
    <h1 class="title">Please choose a Menu Board</h1>

    <!-- Button Container -->
    <div class="button-container">
        <button class="button" on:click={navigateToCheckout}>Menu Board 1</button>
        <button class="button" on:click={navigateToLogin}>Menu Board 2</button>
    </div>
</div>

<style>
    .menuboard {
        display: block;
        
    }

    .title {
        text-align: center;
        font-size: xx-large;
        font-weight: bolder;
    }

    .button-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
        
    }

    .button {
        padding: 15px 30px;
        font-size: 20px;
        color: white;
        background-color: #007bff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        width: 200px;
        text-align: center;
    }

    .button:hover {
        background-color: #0056b3;
    }
</style>
