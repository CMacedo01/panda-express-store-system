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

 </script>

<Navbar></Navbar>
<iframe id="embeddedAppsmith" src="https://198-58-96-145.ip.linodeusercontent.com/app/acc-manager-view/dashboard-673bd4189f50fd2434dacd79" scrolling="yes" seamless="seamless" style="display:block; width:100%; height:100vh;"></iframe>
