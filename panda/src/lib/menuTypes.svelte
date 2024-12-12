<script lang="ts">
    export let data;
    export let bkgCol;
    let nameFormat = "text-center text-5xl font-bold";
    let descFormat = "text-center text-lg";
    let priceFormat = "text-center text-sm";
</script>


<div class="p-4 grid grid-cols-2 grid-rows-3 items-center justify-center" style="background-color: {bkgCol}">
    {#if data.length != 0}
        {#each data as d}
            <div>
                <h2 class={nameFormat}>{d.name}</h2>
                <p class={descFormat}>{d.protein_quantity} entree + {d.side_quantity} side</p>
                <p class={priceFormat}>${d.price}</p>
            </div>
        {/each}
        {:else}
            <h1>Nothing to see here</h1>
    {/if}
    <!-- <div>
        <h2 class="text-center text-7xl">BOWL</h2>
        <p class="text-center text-lg">1 entree + 1 side</p>
    </div>
    <div>
        <h2 class="text-center text-7xl">PLATE</h2>
        <p class="text-center text-lg">2 entrees + 1 side</p>
    </div>
    <div>
        <h2 class="text-center text-7xl">BIGGER PLATE</h2>
        <p class="text-center text-lg">3 entree + 1 side</p>
    </div> -->
</div>

<style>
    
</style>