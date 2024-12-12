<script lang="ts">
    export let data;
    export let color;
    // export let type;
    let itemFormat = "p-2 max-w-200 font-semibold text-xl text-center";
    let priceFormat = "text-xs";
</script>



<div class="grid grid-cols-4" style="background-color: {color}">
    {#if data.length > 0}
        {#each data as d}
        {#if d.price_addition != 0.0}
            <div class="flex flex-row">
                <p class={itemFormat}>{d.name}</p>
                <p class={priceFormat}>+${d.price_addition}</p>
            </div>
            <!-- <p>{d.calories} calories</p> -->
        {:else}
            <p class={itemFormat}>{d.name}</p>
        {/if} 
        {/each}
        {:else}
            <li>No menu items available</li>
    {/if}
    <!-- <p class={itemFormat}>{data[0].name}</p>
    <p class={itemFormat}>{data[1].name}</p>
    <p class={itemFormat}>{data[2].name}</p>
    <p class={itemFormat}>{data[3].name}</p>
    <p class={itemFormat}>{data[4].name}</p>
    <p class={itemFormat}>{data[5].name}</p>
    <p class={itemFormat}>{data[6].name}</p>
    <p class={itemFormat}>{data[7].name}</p> -->
</div>