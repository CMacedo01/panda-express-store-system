<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { signOut } from '@auth/sveltekit/client';


    // Declare activeLink variable
    let activeLink: string;

    // Check if we're in the browser and then try to access localStorage
    if (typeof window !== 'undefined') {
        activeLink = localStorage.getItem("activeLink") || "/"; // Default to "/" if nothing is in localStorage
    } else {
        activeLink = "/"; // Fallback value for SSR (if needed)
    }

    // Update the active link and store it in localStorage
    const activateLink = (button: string) => {
        activeLink = button;
        if (typeof window !== 'undefined') {
            localStorage.setItem("activeLink", button); // Store the active link in localStorage only in the browser
        }
    };
    async function handleSignOut() {
        setTimeout(() => {
            signOut(); // Logs out the user
            goto('/'); // Redirects to the login page
                    }, 1000);
    }
</script>

<div class="navigation-bar">
    <a href="/cashier" class:clicked={activeLink === "/cashier"} on:click={() => activateLink("/cashier")}>Cashier View</a>
    <a href="/menuSelection" class:clicked={activeLink === "/menuSelection"} on:click={() => activateLink("/menuSelection")}>Menu Board</a>
    <a href="/manager" class:clicked={activeLink === "/manager"} on:click={() => activateLink("/manager")}>Manager Area</a>
    <a href="/" class:clicked={activeLink === "/"} on:click={handleSignOut}>Sign Out</a>
    
    
</div>

<style>
    .navigation-bar{
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: 7vh;
        color: rgb(173, 171, 171);
        background-color: #800020;
        text-align: center;
    }
    a {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 25%;
        font-size: large;
        font-weight: 500;

        border: 1px solid black;
    }

    a.clicked {
        color: whitesmoke;
        border-bottom: 4px solid white;
        font-weight: 650;
        font-size: x-large;
    }
</style>
