<script lang="ts">
    export let data;
    export let color;

    let itemSetting = "text-xl px-10 font-semibold"
    let priceSetting = "text-s"
</script>


<div class="flex flex-row justify-center" style="background-color: {color}">
    {#if data.length > 0}
        {#each data as d}
        {#if d.price_addition != 0.0}
            <div class="flex flex-row">
                <p class={itemSetting}>{d.name}</p>
                <p class={priceSetting}>+${d.price_addition}</p>
            </div>
            
        {:else}
            <p class={itemSetting}>{d.name}</p>
        {/if} 
        {/each}
        {:else}
            <p>No menu items available</p>
    {/if}
    <!-- <p class={itemSetting}>bruh</p>
    <p class={itemSetting}>bruh</p>
    <p class={itemSetting}>bruh</p>
    <p class={itemSetting}>bruh</p>
    <p class={itemSetting}>bruh</p>
    <p class={itemSetting}>bruh</p> -->
</div>