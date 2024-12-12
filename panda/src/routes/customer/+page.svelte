<script lang="ts">
	import { resolveRoute } from '$app/paths';
	import { APIClient } from 'openai/core.mjs';
    import { onMount } from 'svelte';
    
    export let data: { 
        menuItems: Array<{ id: number, type: string, price_addition: number, name: string }>, 
        mealTypes: Array<{id: number, name: string, price: number, side_quantity: number, protein_quantity: number}>
        promoCodes: Array<{id: number, discount: number, code: string}>
    };
        
    const { menuItems, mealTypes, promoCodes } = data;

    let fortune = '';
    let weatherData: any = null;
    let weatherError: any = null;

    async function callGPTApi() {
        try {
            const response = await fetch('/api/gpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: 'Generate a fortune that would come out of a fortune cookie.' }),
            })
            
            const data = await response.json();
            if (data.result) {
                fortune = data.result;
            }
            else {
                fortune = 'Error: ' + data.error;
            }
        }
        catch (error) {
            console.error("Error: ", error);
            fortune = "Error: Failed to fetch data from the server";
        }
    }

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
        callGPTApi();
        callWeatherApi();
    })

    //ORDER Object
    type Meal = {
        //meal type id, items array (preferably enum)
        id: number;
        meal_type_id: number;
        meal_items: string[];
        meal_price: number;
    };

    //Order Object
    type Order = {
        meals: Meal[];
        subtotal: number;
    };

    //everything for order object
    let curMealItemNums: number;
    let meal_id: number = 0;
    let currentOrder: Order = {
        meals: [],
        subtotal: 0
    };
    let curMeal: Meal = {
        id: meal_id,
        meal_type_id: 0,
        meal_items: [],
        meal_price: 0
    };

    let subtotal: number = 0.0;
    let curMealPrice: number = 0.0;

    //ENSURING CORRECT # OF PROTEINS/SIDES
    let maxProteinAmount: number = 0;
    let maxSideAmount: number = 0;
    let curProteinAmount: number = 0;
    let curSideAmount: number = 0;

    let typeMap: Map<number, {id: number, name: string, price: number, side_quantity: number, protein_quantity: number}> = new Map();
    let curMealType: {id: number, name: string, price: number, side_quantity: number, protein_quantity: number} | null=null;

    //filling in the hash map
    mealTypes.forEach(item => {
        typeMap.set(item.id, item);
    });

    //setting the current meal
    const setCurMeal = (mealId: number) => {
        //updating CurMeal
        curMeal.meal_type_id = mealId;
        curMeal.meal_items = [];

        //Extracting correct meal name
        curMealType = mealTypes.find(meal => meal.id === mealId) || null;
        if (curMealType) {
            addItemToCheckout({name: curMealType?.name, price_addition: curMealType?.price, type: "meal"});
        }
    }

    //ADDING ITEMS TO ORDER
    //  appropriate logic for side/protein quanities: ensure that side/protein quanity can't be exceeded 
    let selectedItems: Array<{name: string, price_addition: number, type: string}> = [];
    const addItemToCheckout = (item: {name: string, price_addition: number, type: string}) => {
        
        if (item.name == "Soft Drink") {
            curMealPrice = curMealPrice + item.price_addition;
            selectedItems = [...selectedItems, item];
            curMeal.meal_items.push(item.name);
            return;
        }

        if (item.type === "meal") {
            selectedItems = [...selectedItems, item];
            return;
        }

        if (curSideAmount == maxSideAmount && curProteinAmount == maxProteinAmount) {
            return;
        }

        if (curMealType?.name === "A La Carte") {
            if (curProteinAmount !== maxProteinAmount) {
                selectedItems = [...selectedItems, item];
                ++curProteinAmount;
            }
            if (item.price_addition > 0) {
                curMealPrice = curMealPrice + item.price_addition;
            }
        }

        if (item.type === "entree") {
            if (curProteinAmount != maxProteinAmount) {
                selectedItems = [...selectedItems, item];
                ++curProteinAmount;
                if (item.price_addition > 0) {
                    curMealPrice = curMealPrice + item.price_addition;
                }
            }
        }
        else if (item.type === "side") {
            if (curSideAmount != maxSideAmount) {
                selectedItems = [...selectedItems, item];
                ++curSideAmount;
                if (item.price_addition > 0) {
                    curMealPrice = curMealPrice + item.price_addition;
                }
            }
        }
        else if (item.type === "extra" && curMealType?.name !== "A La Carte") {
            selectedItems = [...selectedItems, item];
        }

        //adding item to curMeal
        curMeal.meal_items.push(item.name);
        // console.log("Current meal: ", curMeal);
        // console.log(curSideAmount, curProteinAmount, maxSideAmount, maxProteinAmount);
    }

    //this function sets max side_amount and protein_amount to the current meal type 
    //  should occur each time we reset meals
    const setCounts = (mealId: number) => {
        mealActive = true;
        curProteinAmount = 0;
        curSideAmount = 0;
        curMealPrice = 0;

        const mealType = typeMap.get(mealId);
        curMealPrice = curMealPrice + (typeMap.get(mealId)?.price ?? 0);

        if (mealType) {
            maxSideAmount = mealType.side_quantity;
            maxProteinAmount = mealType.protein_quantity;
            curMealItemNums = maxSideAmount + maxProteinAmount;
        }
        else {
            maxSideAmount = 0;
            maxProteinAmount = 0;
        }
    }

    //TYPES BUTTON CLICK
    //Not allowing more than one meal at a time
    let mealActive: boolean = false;

    let activeButton = "";
    let activeTypeButton = "";
    const setFirstActiveButton = (button:string) => {
        curMealPrice = 0;
        mealActive = false;
        selectedItems = [];
        curMeal.meal_items = [];
        curMeal.meal_type_id = 0;
        activeButton = button;
    }
    const setActiveType = (button:string) => {
        if (!mealActive) {  
            activeTypeButton = button;
        }
    }

    //functionality for initial button press (options bar)
    let firstActivePane = "default-first";
    let sndActivePane = "";

    const activateFirstPane = (pane: string) => {
        firstActivePane = pane;

        //using second menu items window if "meal-types"
        if (pane === 'meal-types') {
            sndActivePane = "default-snd";
        }
        else {
            sndActivePane = "";
        }
    }

    const activateSndPane = (pane:string) => {
        sndActivePane = pane;
    }

    //A LA CARTE CONFIG
    const alcConfig = () => {
        const mealType = "A La Carte";

        setActiveType(mealType);
        const mealData = typeMap.get(5);

        if (mealData) {
            setCurMeal(5);
            
            curMealPrice = curMealPrice + 4.40;
            curProteinAmount = 0;
            curSideAmount = 0;
            maxSideAmount = 0;
            maxProteinAmount = mealData.protein_quantity || 1;
        } else {
            console.error(`A La Carte not found`);
        }
    }

    //CLEAR MEAL
    const clearMeal = () => {
        mealActive = false;
        selectedItems = [];
        curMeal.meal_items = [];
        curMeal.meal_type_id = 0;
        curMealPrice = 0;
        activateFirstPane("default-first");
        setFirstActiveButton("");
        setActiveType("");
    }

    //ADD MEAL OPERATION
    const addMeal = () => {
    
        if (curSideAmount == maxSideAmount && curProteinAmount == maxProteinAmount) {
            ++meal_id;
            curMeal.id = meal_id;
            curMeal.meal_price = curMealPrice;
            currentOrder.meals.push({...curMeal});
            subtotal += curMealPrice;
            currentOrder.subtotal = subtotal;
            selectedItems = [];
            
            curMeal.meal_items = [];
            curMeal.meal_type_id = 0;
            activateFirstPane("default-first");
            setFirstActiveButton("");
            setActiveType("");
        }
    }

    //CHECKOUT Operation
    async function handleCheckout() {
        const orderData = {
            subtotal: currentOrder.subtotal,
            orderMeals: currentOrder.meals
        };
        try {
            const response = await fetch('/cashier', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            console.log(result);

            if (result.success) {
                // Clear the order and reset the state
                activateFirstPane("default-first");
                setFirstActiveButton("");
                setActiveType("");
                selectedItems = [];
                subtotal = 0;
                currentOrder.meals = [];
                currentOrder.subtotal = 0;
            } else {
                console.error('Checkout failed');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    }

    //PROMO CODE
    //Add checks to ensure promo code is valid
    let userPromoCode: string = '';
    let promoDiscount: number | null = null;
    let prePromoSubtotal: number;

    function handleEnter(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            //CHECK IF PROMO CODE IS VALID, then set to null
            const isCodeValid = promoCodes.some(promo => promo.code === userPromoCode);

            if (isCodeValid) {
                const discount = promoCodes.find(promo => promo.code === userPromoCode)?.discount;
                
                if (discount !== undefined) {
                    promoDiscount = discount;
                    const promoMeal = {
                        id: ++meal_id,
                        meal_type_id: 6,
                        meal_items: ["Discount"],
                        meal_price: promoDiscount
                    }
                    prePromoSubtotal = subtotal;
                    
                    let item = {name: "Discount", price_addition: promoMeal.meal_price, type: "discount", id:meal_id};
                    selectedItems = [...selectedItems, item];
                    currentOrder.meals.push(promoMeal);
                    currentOrder.subtotal -= currentOrder.subtotal*(promoMeal.meal_price/100);
                    subtotal -= subtotal*(promoMeal.meal_price/100);
                    userPromoCode = "";
                }
            }
        }
    }

    //REMOVE meals
    function removeMeal(mealId: number): void {
        // Find the meal to delete
        const mealToDelete = currentOrder.meals.find(meal => meal.id === mealId);
        if (!mealToDelete) return;

        
        // Update the subtotal
        const mealType = mealTypes.find(mt => mt.id === mealToDelete.meal_type_id);
        if (mealToDelete.meal_type_id === 6) {
            if (promoDiscount) {
                subtotal = prePromoSubtotal;
            }
            
        }
        else if (mealType) {
            subtotal -= mealToDelete.meal_price;
        }

        // Filter out the meal from the order
        currentOrder.meals = currentOrder.meals.filter(meal => meal.id !== mealId);
    }


</script>


<svelte:head>
    <script type="text/javascript">
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL}, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</svelte:head>



<div class="container">
    <div class="options-bar">
        <div class="logo-area">
            <img src="/logo_331.jpg" alt="Company Logo" class="logo" />
        </div>
        <button class="meals-button" class:clicked={activeButton==='meals-button'} on:click={() => {
            activateFirstPane('meal-types'),
            setFirstActiveButton('meals-button')
            }}>Meals</button>
        <button class="alc-button" class:clicked={activeButton==='alc-button'} on:click={() => {
            activateFirstPane('alc-pane'),
            setFirstActiveButton('alc-button'),
            alcConfig()
            }}>A La Carte</button>
        <button class="drinks-button" class:clicked={activeButton==='drinks-button'} on:click={() => {
            activateFirstPane('drinks-pane')
            setFirstActiveButton('drinks-button')
            }}>Drinks</button>
        <button class="extras-button" class:clicked={activeButton==='extras-button'} on:click={() => {
            activateFirstPane(''),
            setFirstActiveButton('extras-button')
            }}>Extras</button>
        <button class="view-order-button" class:clicked={activeButton==='view-order-button'} on:click={() => {
            activateFirstPane('checkout-pane')
            setFirstActiveButton('view-order-button')
            }}>View Order</button>
        <div class="totals">${subtotal.toFixed(2)}</div>
    </div>
    <div class="content-area">
        <div class="pane">
            <div class="default-first" class:visible={firstActivePane === 'default-first'}>
                <h3>Choose An Option</h3>
            </div>
            <div class="meal-types" class:visible={firstActivePane === 'meal-types'}>
                {#each mealTypes as type}
                    {#if type.name !== "A La Carte"}
                        <button class="types-button" class:clicked={activeTypeButton === type.name} on:click={() => {
                            if (!mealActive) {
                                activateSndPane('menu-items');
                                setActiveType(type.name);
                                setCounts(type.id);
                                setCurMeal(type.id);
                            }
                            
                        }}>{type.name}</button>
                    {/if}
                {/each}
            </div>
            <div class="default-snd" class:visible={sndActivePane === 'default-snd'}>
                Choose an option
            </div>
            <div class="menu-items" class:visible={sndActivePane === 'menu-items'}>
                <div class="sides-pane">
                    {#each menuItems as item}
                        {#if item.type == "side"}
                            <button class="sides-button" on:click = {() => addItemToCheckout(item)}>
                                {item.name}
                            </button>
                        {/if}
                    {/each}
                </div>
                <div class="proteins-pane">
                    {#each menuItems as item}
                        {#if item.type == "entree"}
                            <button class="proteins-button" on:click = {() => addItemToCheckout(item)}>
                                {item.name}
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>
            <div class="alc-pane" class:visible={firstActivePane === 'alc-pane'}>
                <div class="sides-pane">
                    {#each menuItems as item}
                        {#if item.type == "side"}
                            <button class="sides-button" on:click = {() => {
                                addItemToCheckout(item);
                            }}>{item.name}
                            </button>
                        {/if}
                    {/each}
                </div>
                <div class="proteins-pane">
                    {#each menuItems as item}
                        {#if item.type == "entree"}
                            <button class="proteins-button" on:click = {() => addItemToCheckout(item)}>
                                {item.name}
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>
            <div class="drinks-pane" class:visible={firstActivePane === 'drinks-pane'}>
                {#each menuItems as item}
                    {#if item.type == "extra" && item.name == "Soft Drink"}
                        <button class="drink-button" on:click = {() => {
                            addItemToCheckout(item);
                        }}>{item.name}
                        </button>
                    {/if}
                {/each}
            </div>
            <div class="extras-pane" class:visible={firstActivePane === 'extras-pane'}>
                {#each menuItems as item}
                    {#if item.type == "extra"}
                        <button class="extras-button" on:click = {() => {
                            addItemToCheckout(item);
                        }}>{item.name}
                        </button>
                    {/if}
                {/each}
            </div>
            <div class="checkout-pane" class:visible={firstActivePane === 'checkout-pane'}>
                <h2>Your Order </h2>
                {#if currentOrder.meals.length === 0}
                    <h2>You have not started a meal</h2>
                {:else}
                    <ul>
                        {#each currentOrder.meals as meal}
                            <li>
                                {#if typeMap.get(meal.meal_type_id)}
                                <div class="meal-info">
                                    {typeMap.get(meal.meal_type_id)?.name}
                                    <span class="meal-price">
                                        {#if typeMap.get(meal.meal_type_id)?.price}
                                            {(typeMap.get(meal.meal_type_id)?.price)?.toFixed(2)}
                                        {/if}
                                    </span>
                                </div>
                                    
                                    
                                {/if}
                                <ul>
                                    {#each meal.meal_items as item}
                                        {#if item === "Discount"}
                                            {item}
                                            <span class="meal-price">
                                                {promoDiscount}%
                                            </span>
                                        {:else}
                                            <li>{item}</li>
                                        {/if}
                                    {/each}
                                </ul>
                                <button on:click={() => removeMeal(meal.id)}>Remove Meal</button>
                            </li>
                            
                        {/each}
                    </ul>
                    <h2>Subtotal: ${subtotal.toFixed(2)}</h2>
                {/if}
                <div class="checkout-options">
                    {#if currentOrder.meals.length > 0}
                        <button class="clear-order" on:click= {() => {
                            selectedItems = []
                            subtotal = 0.0;
                            curMeal.meal_items = [];
                            curMeal.meal_type_id = 0;
                            currentOrder.meals = [];
                            currentOrder.subtotal = 0;
                            setActiveType("");
                        }}>
                            Clear Order
                        </button>
                        <button class="checkout-button" on:click={() => {
                            handleCheckout();
                        }}>
                            Checkout
                        </button>
                        <div class="promo-box">
                            <input 
                                type="text"
                                bind:value={userPromoCode}
                                placeholder="PROMO CODE"
                                class="w-64 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                on:keydown={handleEnter}
                            />
                        </div>
                    {/if}
                    
                </div>
                
            </div>
        </div>
        <div class="info-bar-wrapper">
            <div class="info-bar">
                <div class="weather-wrapper">
                    <div class="weather-pane">
                        {#if weatherError}
                            <p>{weatherError}</p>
                        {:else if weatherData}
                            <h3>{weatherData.name}, {weatherData.sys.country}</h3>
                            <p>Temperature: {weatherData.main.temp.toFixed(0)}°F</p>
                            <p>Humidity: {weatherData.main.humidity}%</p>
                            <br><p>{weatherData.weather[0].description}</p>
                        {:else}
                            <p>Loading weather data...</p>
                        {/if}
                    </div>
                </div>
                
                <div class="fortune-pane">
                    <p>{fortune}</p>
                </div>
            </div>
        </div>
        
    </div>
    <div class="semi-checkout">
        <div class="current-order">
            <ul>
                {#each selectedItems as item}
                <li>
                    <span class="item-name">
                        {#if (item.type === "meal")}
                            <b><br><br>{item.name}</b>
                        {:else}
                            {#if (item.name != "Discount")}
                                <p>&emsp;{item.name}</p>
                            {/if}
                        {/if}
                    </span>
                    <span class="item-price">
                        {#if (item.type != "meal") && (item.price_addition > 0) && (item.name != "Discount")}
                            <p>+({item.price_addition.toFixed(2)})</p>
                        {/if}
                    </span>
                </li>
                {/each}
            </ul>
        </div>

        <div id="google_translate_element"></div>
        <div class="clear-meals-area">
            <button class="clear-meals-button" on:click= {() => clearMeal()}>
            Clear Meal
            </button>
        </div>
        <div class="semi-addOrder-area">
            <!-- TODO: this should just add meal item to orders -->
            <button class="semi-addOrder-button" on:click= {() =>{
                addMeal();
            }}>
                Add to Order
            </button>
        </div>
    </div>
</div>

<style>

    .logo {
        max-width:80%;
        height: auto;
        object-fit: contain;
    }

    .container {
        max-width: none;
        width: 100vw;
        height: 100vh;
        display: flex;
        overflow: hidden;
        background-color: #8d722e;
    }

    /* OPTIONS BAR */
    .options-bar{
        height: 100vh;
        width: 16%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        position: relative;
        /* padding: 5px; */
        background-color: #94772d;
    }
    .logo-area {
        display: flex;
        height: 20%;
        width: 100%;

        justify-content: center;
        align-items: center;

        margin-top: 4px;
        border-top-left-radius: 40px;
        border-top-right-radius: 40px;
        background-color: #3f0505;
    }
    .options-bar button {
        width: 100%;
        /* margin-top: 4px;
        margin-right: 14px;
        margin-left: 14px; */
        min-height: 100px;
        border: 2px solid #8d722e;
        color: #d5cbb2;
        font-size: x-large;
        font-weight: 600;
    }
    .view-order-button {
        margin-bottom: 1px;
        border-bottom-left-radius: 40px;
        border-bottom-right-radius: 40px;
        background-color: #3f0505;
        height: 25%;
    }
    .options-bar button:not(.view-order-button) {
        background-color: #3f0505;
    }   
    
    .options-bar button.clicked {
        background-color: #ad7b46;
        color: rgb(192, 192, 192);
    }
    .options-bar button:hover {
        background-color: #ad7b46;
        color: rgb(192, 192, 192);
    }
    .totals {
        display: flex;
        height: 30%;
        width: 100%;
        margin-top: 2px;
        margin-bottom: 2px;
        background-color: #3f0505;

        color: #d5cbb2;
        align-items: center;
        justify-content: center;
        font-size: xxx-large;
        font-weight: bold;
        
        border-top-left-radius: 40px;
        border-top-right-radius: 40px;
        border-bottom-left-radius: 40px;
        border-bottom-right-radius: 40px;

    }


    .content-area {
        flex: 1;
        height: 100%;
        width: 100%;

        display: flex;
        flex-direction: column;

        background-color: #d9cab3;
    }

    /* MEAL TYPE / MENU ITEMS */
    .pane {
        display: flex;
        height: 80vh;
        flex: 1;
    }
    .meal-types, .menu-items, .alc-pane, .drinks-pane, .checkout-pane, .extras-pane {
        display:none;
    }
    .default-first {
        display:none;
    }
    .default-first.visible {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        
        color: rgb(79, 79, 79);
        font-size: xxx-large;
        font-weight: 500;
        background-color: #d9cab3;
    }
    .meal-types.visible {
        flex: 1;
        max-width: 17%;

        display: flex;
        flex-direction: column;

        color: #d5cbb2;
        background-color: #94772d;
    }
    .types-button {
        flex-grow: 1;
        background-color: #3f0505;
        border-top:4px solid #94772d;
        font-size: x-large;
        font-weight: 600;

    }
    .meal-types button:first-child {
        margin-top: 4px;
        border-top-left-radius: 40px;
        border-top-right-radius: 40px;
    }
    .meal-types button:last-child {
        margin-bottom: 4px;
        border-bottom-left-radius: 40px;
        border-bottom-right-radius: 40px;
    }
    .types-button.clicked {
        background-color: #ad7b46;
        color: rgb(192, 192, 192);
    }
    .types-button:hover {
        background-color: #ad7b46;
    }

    .default-snd {
        display:none;
        background-color: #d9cab3;
    }
    .default-snd.visible {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;

        color: rgb(79, 79, 79);
        font-size: xxx-large;
        font-weight: 500;
        background-color: #d9cab3;
    }
    .menu-items.visible {
        flex: 1;

        display: flex;
        flex-direction: column;
        padding: 20px;
        margin-left: 10px;
        overflow-y: auto;
        max-height: 1000px;
        background-color: #d9cab3;
    }
    .sides-pane {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 70px;
    }
    .proteins-pane {
        display: flex;
        flex-wrap: wrap;
    }
    .sides-button, .proteins-button {
        width: 255px;
        height: 120px;
        margin: 5px;
        font-size: large;
        font-weight: 500;
        color: rgb(43, 43, 43);

        border-radius: 15px;
    }
    .sides-button:hover {
        background-color: #77bc94;
        transition: color 100ms;
    }
    .proteins-button:hover {
        background-color: #d18379;
        transition: color 100ms;
    }
    .sides-button {
        background-color: #4cb778;
    }
    .proteins-button {
        background-color: #d16455;
    }


    .alc-pane.visible {
        background-color: #d9cab3;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px;
        overflow-y: auto;
    }

    .drinks-pane.visible {
        background-color: #d9cab3;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 20px;
        overflow-y: auto;
    }
    .drink-button {
        width: 325px;
        height: 220px;
        margin: 5px;
        font-size: large;
        font-weight: 500;
        background-color: rgb(150, 177, 186);

        border-radius: 15px;
    }
    .drink-button:hover {
        background-color: rgb(140, 175, 187);
        transition: color 100ms;
    }

    .extras-pane.visible {
        flex: 1;

        display: flex;
        flex-direction: column;
        padding: 20px;
        margin-left: 10px;
        overflow-y: auto;
        max-height: 1000px;
        background-color: #d9cab3;
    }


    /*SEMI CHECKOUT */
    .semi-checkout {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;

        max-width: 15vw;
        background-color: #3f0505;
    }
    .current-order {
        height: 70%;
        max-height: 70%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 20px;
        font-size: x-large;
        color: #d5cbb2;
        background-color: #3f0505;
    }
    .clear-meals-area {
        height: 10%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-top: 4px solid #94772d;
    }
    .clear-meals-button {
        width: 60%;
        height: 50%;
        border-radius: 10px;
        background-color: rgb(169, 169, 225);
    }
    .clear-meals-button:hover {
        background-color: rgb(85, 85, 186);
    }
    .semi-addOrder-area {
        height: 20%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-top: 4px solid #94772d;
    }
    .semi-addOrder-button {
        width: 80%;
        height: 50%;
        border-radius: 10px;
        background-color: rgb(87, 174, 87);
    }
    .semi-addOrder-button:hover {
        background-color: rgb(46, 140, 46);
    }


    /* CHECKOUT PANE */
    .checkout-pane.visible {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        color: #530101;      
        overflow-y: auto;
        background-color: #d9cab3;
    }
    .checkout-pane h2:first-of-type {
        align-self: flex-start;
        width: 100%;
        text-align: center;
    }
    .checkout-pane h2 {
        font-size: xxx-large;
        margin: 10px 0;                
    }

    .checkout-pane ul {
        font-size: x-large;
        list-style-type: none;         
        padding: 0;                
    }

    .checkout-pane ul li {
        padding-left: 40px;
        margin: 5px 0;          
    }
    .meal-info {
        display: flex;              
        justify-content: space-between; 
        align-items: center;
    }
    
    .meal-price {
        margin-left: 100px;   
        font-style: italic;    
        color: #530101;   
    }
    .checkout-options {
        margin-top: auto;
        margin-bottom: 25px;
        display: flex;
        width: 80%;
        justify-content: space-between;
        gap: 50px;
    }
    .clear-order {
        width: 175px;
        height: 75px;
        font-size: x-large;
        font-weight: 600;

        color: white;
        border-radius: 15px;
        background-color: rgb(193, 22, 22);
    }
    .checkout-button {
        width: 175px;
        height: 75px;
        font-size: x-large;
        font-weight: 600;

        color: white;
        border-radius: 15px;
        background-color: rgb(6, 114, 6);
    }



    /* BOTTOM BAR */
    .info-bar {
        height: 100%;
        max-width: 100%;
        background-color: #3f0505;
        border-radius: 1px;
        display: flex;

        border-top-right-radius: 40px;
        border-bottom-right-radius: 40px;
    }
    .info-bar-wrapper {
        height: 20%;
        max-width: 100%;
        background-color: #94772d;
    }
    .weather-wrapper {
        width: 20%;
        background-color: #94772d;
    }
    .weather-pane {
        position: relative;
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
        width: 100%;
        height: 100%;
        padding: 15px;
        display: flex;
        flex-direction: column;
        text-align: center;
        justify-content: center;
        align-items: center;
        
        font-size: medium;
        font-weight: 600;
        color: #ADD8E6;
        overflow: hidden;

        background-color: #3f0505;
    }
    .weather-pane h3 {
        font-size: x-large;
    }
    .fortune-pane {
        width: 80%;
        padding: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: x-large;
        
        font-family: "Cursive", "Lucida Handwriting";

        color:#cba135;   
        
    }


</style>
