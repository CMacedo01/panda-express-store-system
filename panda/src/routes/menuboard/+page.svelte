<script lang="ts">
    import Navbar from '$lib/navbar.svelte';
    import MenuItem from '$lib/menuItem.svelte';
    import MenuTypes from '$lib/menuTypes.svelte';
    import DisplayItems from '$lib/displayItems.svelte';
    import AdditionalItems from '$lib/additionalItems.svelte';

    export let data: { 
        menuItemsEntree: Array<{ id: number, type: string, price_addition: number, name: string, calories: integer }>
        menuItemsSide: Array<{ id: number, type: string, price_addition: number, name: string, calories: integer }>
        menuItemsExtra: Array<{ id: number, type: string, price_addition: number, name: string, calories: integer }>
        menuMealTypes: Array<{ id: number, type: string, price: number, side_quantity: number, protein_quantity: number }>
    };

    let bgURL = "/assets/PDbackground.svg"
    let bgClear = "background-color: rgba(255, 255, 255, 0.7); border-radius: 20px;"
    let colorYellow = "#ffffff"
    let colorMaroon = "#3f0505"

    const { menuItemsEntree, menuItemsSide, menuItemsExtra, menuMealTypes } = data;
    // console.log("Entrees " + JSON.stringify(menuItemsEntree) + "\n\nSides " + JSON.stringify(menuItemsSide));

    let weatherData: any = null;
    let weatherError: any = null;

    /**
     * Gathers real time information for the local weather
    */
    async function callWeatherApi() {
        // Check if geolocation is available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
    
                // Send coordinates to the server-side endpoint
                try {
                    const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
        
                    if (res.ok) {
                        weatherData = data;
                    }
                    else {
                        weatherError = data.error || "Failed to fetch weather data.";
                    }
                } 
                catch (error) {
                    weatherError = "Error fetching weather data from the server.";
                }
            },
            (error) => {
                weatherError = "Geolocation permission denied or failed.";
            }
            );
        } else {
            weatherError = "Geolocation is not supported by this browser.";
        }
    }
    
    // TODO: Disabling the API calls onMount to prevent using all tokens
    onMount(() => {
        callWeatherApi();
    })
</script>

<!-- background-image: url({bgURL}); background-size: contain; background-position: center; background-repeat: no-repeat;  -->
<div class="flex object-cover max-h-screen max-w-screen min-h-screen min-w-screen grid flex-col" style="background-color: {colorMaroon}">
    
    <h1 class="text-5xl top-0 text-center font-bold text-8xl" style="color: {colorYellow}">MENU</h1>

    <!-- DLLM DLLM DLLM DLLM DLLM -->
    <div class="flex flex-row text-left object-left mx-auto my-auto items-center p-5 pt-0">
        <MenuTypes data = {menuMealTypes} bkgCol={colorYellow}></MenuTypes>
        <h1 class="items-center justify-center text-8xl font-bold" style="color: {colorYellow}">+</h1>
        <div class="flex flex-col">
            <h1 class="text-center font-bold text-2xl" style="color: {colorYellow}">Entrees</h1>
            <DisplayItems data = {menuItemsEntree} color = {colorYellow}></DisplayItems>
            <h1 class="text-center font-bold text-2xl" style="color: {colorYellow}">Side</h1>
            <DisplayItems data = {menuItemsSide} color = {colorYellow}></DisplayItems>
        </div>
        <!-- <div class="flex flex-col">
            <MenuItem></MenuItem>
            <MenuItem></MenuItem>
            <MenuItem></MenuItem>
        </div> -->
        
    </div>
    <div class="flex-row">
        <h1 class="text-center text-3xl font-bold" style="color: {colorYellow}">Additional Items</h1>
        <AdditionalItems data={menuItemsExtra} color={colorYellow}></AdditionalItems>
    </div>
    

    <!-- weather app -->
    <div class="fixed top-0 bg-white">
        {#if weatherError}
            <p>{weatherError}</p>
        {:else if weatherData}
            <!-- <h2>Weather for {weatherData.name}, {weatherData.sys.country}</h2> -->
            <p class="font-bold text-xl">{weatherData.weather[0].description}</p>
            <p>Temperature: {weatherData.main.temp}°F</p>
            <!-- <p>Humidity: {weatherData.main.humidity}%</p> -->
        {:else}
            <p>Loading weather data...</p>
        {/if}
    </div>
    
</div>

<style>

</style>
