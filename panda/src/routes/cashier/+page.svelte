<script lang="ts">
    import { userRole } from '$lib/stores';
    import { onMount } from 'svelte';
    // Redirect if the user is not an employee
    /*
    onMount(() => {
        userRole.subscribe((role) => {
            if (role !== 'employee') {
                window.location.href = '/'; // Redirect to home/landing page
            }
        });
    });
    */
   //-------------- auth guard --------------
     
     import { page } from '$app/stores';
     import { goto } from '$app/navigation';
     import Navbar from '$lib/navbar.svelte';
	import { signOut } from '@auth/sveltekit/client';
	import { redirect } from '@sveltejs/kit';
    let isManager: boolean = false;
    let firstName: string = "";
    let lastName: string = "";


    // onMount(() => {
    //     const session = $page.data.session ?? null;
    //     const employee = $page.data.employee;
    //     const currentPath = $page.url.pathname;
    //     const redirectData = authGuard(session, employee, currentPath);
    //     if (session) {
    //         isManager = $page.data.employee.is_manager;
    //         firstName = $page.data.employee.firstname;
    //         lastName = $page.data.employee.lastname;
    //     } 
        
        
    //     if (redirectData && redirectData.location !== currentPath) {
    //         goto(redirectData.location);
    //     }
        
    // })
     //----------------------------------------
     async function handleSignOut(){
        
        signOut();
     }

    export let data: { 
        menuItems: Array<{ id: number, type: string, price_addition: number, name: string }>, 
        mealTypes: Array<{id: number, name: string, price: number, side_quantity: number, protein_quantity: number}>
        promoCodes: Array<{id: number, discount: number, code: string}>
    };
        
    const { menuItems, mealTypes, promoCodes } = data;
    

    //EVERYTHING REGARDING CREATING ORDERS
    //Meals Object
    type Meal = {
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

    let curMealItemNums: number;
    let currentMeals: Meal[];
    let meal_id: number = 0;
    let currentOrder: Order = {
        meals: [],
        subtotal: 0
    };
    //initializing to 0
    let curMeal: Meal = {
        id: meal_id,
        meal_type_id: 0,
        meal_items: [],
        meal_price: 0
    };

    let subtotal: number = 0.0;
    let curMealPrice: number = 0.0;

    //SWITCHING WINDOWS
    let toggleSwitch = false;

    const switchToItems = () => {
        toggleSwitch = true;
    }

    const switchToTypes = () => {
        toggleSwitch = false;
        if (curMeal.meal_items.length === curMealItemNums) {
            currentMeals.push(curMeal);
        }
    }


    //ENSURING CORRECT # OF PROTEINS/SIDES
    let maxProteinAmount: number = 0;
    let maxSideAmount: number = 0;
    let curProteinAmount: number = 0;
    let curSideAmount: number = 0;

    let typeMap: Map<number, {id: number, name: string, price: number, side_quantity: number, protein_quantity: number}> = new Map();
    let curMealType: {id: number, name: string, price: number, side_quantity: number, protein_quantity: number} | null=null;

    mealTypes.forEach(item => {
        typeMap.set(item.id, item);
    });

    //setting the current meal
    const setCurMeal = (mealTypeId: number) => {
        //updating CurMeal
        meal_id = ++meal_id;
        curMeal.id = meal_id;
        curMeal.meal_type_id = mealTypeId;
        curMeal.meal_items = [];

        //Extracting correct meal name
        curMealType = mealTypes.find(meal => meal.id === curMeal.meal_type_id) || null;
        console.log(curMealType?.name);
        if (curMealType) {
            addItemToCheckout({name: curMealType?.name, price_addition: curMealType?.price, type: "meal", id: meal_id});
        }
    }

    //this function sets side_amount and protein_amount to the current meal types
    //  side/protein amount
    const setCounts = (mealId: number) => {
        curProteinAmount = 0;
        curSideAmount = 0;
        curMeal.meal_price = 0;

        const mealType = typeMap.get(mealId);
        curMeal.meal_price += (typeMap.get(mealId)?.price ?? 0);
        subtotal += (typeMap.get(mealId)?.price ?? 0);

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


    let selectedItems: Array<{name: string, price_addition: number, type: string, id:number}> = [];
    const addItemToCheckout = (item: {name: string, price_addition: number, type: string, id: number}) => {
        const newItem = { ...item, id: meal_id };
        if (item.type === "meal") {
            selectedItems = [...selectedItems, newItem];
            return;
        }

        if (curMealType?.name === "A La Carte") {
            if (curProteinAmount !== maxProteinAmount) {
                selectedItems = [...selectedItems, newItem];
                ++curProteinAmount;
            }
            if (item.price_addition > 0) {
                subtotal = subtotal + item.price_addition;
                curMeal.meal_price += item.price_addition;
            }
            switchToTypes();
        }


        if (item.type === "entree") {
            if (curProteinAmount != maxProteinAmount) {
                selectedItems = [...selectedItems, newItem];
                ++curProteinAmount;
                if (item.price_addition > 0) {
                    subtotal = subtotal + item.price_addition;
                    curMeal.meal_price += item.price_addition;
                }
            }
        }
        else if (item.type === "side") {
            if (curSideAmount != maxSideAmount) {
                selectedItems = [...selectedItems, newItem];
                ++curSideAmount;
                if (item.price_addition > 0) {
                    subtotal = subtotal + item.price_addition;
                    curMeal.meal_price += item.price_addition;
                }
            }
        }
        else if (item.type === "extra" && curMealType?.name !== "A La Carte") {
            selectedItems = [...selectedItems, newItem];
        }

        //adding item to curMeal
        curMeal.meal_items.push(item.name);
        console.log(item.id);
        if (curSideAmount === maxSideAmount && curProteinAmount === maxProteinAmount) {
            // Needed to make a shallow copy to prevent the object being deleted after being pushed to curOrder
            const mealCopy = { ...curMeal, meal_items: [...curMeal.meal_items] }; 
            currentOrder.meals.push(mealCopy);
            curMeal.meal_items = [];
            curMeal.meal_type_id = 0;
            switchToTypes();
        }
    }

    const checkout = () => {
        console.log(JSON.stringify(currentOrder));
    }

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
                selectedItems = [];
                subtotal = 0;
                currentOrder.meals = [];
                currentOrder.subtotal = 0;
                switchToTypes();
            } else {
                console.error('Checkout failed');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    }

    //MENU ITEM COLOR C

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

    //REMOVE MEALS
    function removeItemFromCheckout(id: number): void {
        //Find the meal to delete
        const mealToDelete = currentOrder.meals.find(meal => meal.id === id);
        if (!mealToDelete) return;
        //Update the subtotal
        if (mealToDelete.meal_type_id === 6) {
            subtotal = prePromoSubtotal;
        }
        else {
            subtotal -= mealToDelete.meal_price;
        }
        
        // Filter out the meal from the current order
        currentOrder.meals = currentOrder.meals.filter(meal => meal.id !== id);

        // Remove all selected items associated with the meal
        selectedItems = selectedItems.filter(item => item.id !== id);
    };


</script>




<div class="container">
    <Navbar></Navbar>       

    <div class="wrapper">
        <div class="options-panel">
            <div class="header">
                <h1 class="title">{firstName} {lastName}</h1>
                <button class="logout" on:click={() => handleSignOut()}>Sign Out</button>
            </div>
    
            <!-- Meal Types -->
            {#if !toggleSwitch} 
                <div class="types-panel">
                    {#each mealTypes as type}
                        <button class="types-button" on:click={() => {
                            switchToItems();
                            setCounts(type.id);
                            setCurMeal(type.id)
                        }}>
                            {type.name}
                        </button>
                    {/each}
                </div> 
            {/if}
            <!-- Menu Items -->
            {#if toggleSwitch}
                <div class="items-panel">
                    <div class="sides">
                        {#each menuItems as item}
                            {#if item.type == "side"}
                                <button class="sides-button" on:click= {() => addItemToCheckout(item)}>
                                    {item.name}
                                </button>
                            {/if}
                        {/each}
                    </div>
                    <div class="proteins">
                        {#each menuItems as item}
                            {#if item.type == "entree"}
                                <button class="proteins-button" on:click= {() => addItemToCheckout(item)}>
                                    {item.name}
                                </button>
                            {/if}
                        {/each}
                    </div>
                    <div class="extras">
                        {#each menuItems as item}
                            {#if item.type == "extra"}
                                <button class="extras-button" on:click= {() => addItemToCheckout(item)}>
                                    {item.name}
                                </button>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}
            
        </div>
        <div class="order-panel">
            <div class="order-header">
                Checkout
            </div>
            <!-- CHECKOUT AREA -->
            <div class="checkout">
                <ul>
                    {#each selectedItems as item}
                        <li>
                            {#if item.type === "meal" || item.name === "Discount"}
                                <div class="checkout-item">
                                    <div class="item-content">
                                        <span class="item-name">
                                            <b><br><br>{item.name}</b>
                                        </span>
                                        <div class="right-side">
                                            <span class="item-price">
                                                {#if item.name === "Discount"}
                                                <b><br><br>-{item.price_addition.toFixed(0)}%</b>
                                                {:else}
                                                <b><br><br>+{item.price_addition.toFixed(2)}</b>
                                                {/if}
                                            </span>
                                            <button class="delete-meal" on:click={() => removeItemFromCheckout(item.id)}><br><br>X</button>
                                        </div>
                                        </div>
                                </div>
                            {:else}
                                <div class="checkout-item non-meal-item">
                                    <div class="item-content">
                                        <span class="item-name">
                                            <p>&emsp;{item.name}</p>
                                        </span>
                                        <span class="item-price">
                                            {#if item.price_addition > 0.0}
                                                <p>+({item.price_addition.toFixed(2)})</p>
                                            {/if}
                                        </span>
                                    </div>
                                </div>
                            {/if}
                            
                        </li>
                    {/each}

                </ul>
            </div>
            <div class="totals">
                <h2>Subtotal: ${subtotal.toFixed(2)} </h2>
                <h2>Grand Total: ${((subtotal+subtotal*0.25).toFixed(2))}</h2>
                <div class="promo-box">
                    <input 
                        type="text"
                        bind:value={userPromoCode}
                        placeholder="PROMO CODE"
                        class="w-64 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        on:keydown={handleEnter}
                    />
                </div>
                <div class="checkout-options">
                    <button class="clear-button" on:click= {() => {
                            selectedItems = []
                            subtotal = 0.0;
                            curMeal.meal_items = [];
                            curMeal.meal_type_id = 0;
                            currentOrder.meals = [];
                            currentOrder.subtotal = 0;
                            switchToTypes();
                        }}>
                        Clear Order
                    </button>
                    <button class="checkout-button" on:click= {() =>{
                        //update this later
                        currentOrder.subtotal = subtotal;
                        selectedItems = [];
                        subtotal = 0;
                        checkout();
                        handleCheckout();
                        switchToTypes();
                    }}> 
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>



<style>
    .container {
        max-width: 100%;
        max-height: 100vh;
        height: 100vh;
        background-color: #1b1b1f;
        display: block;
        overflow-y: auto;
    }
    .wrapper {
        height: 100vh;
        display: flex;
        max-height: 93vh;
        overflow-y: auto;
    }
    .options-panel {
        max-height: 95%;
        width: 90%;
        background-color: #2f2f36;
        margin: 15px;
        overflow-y: auto;
        border-radius: 1%;
        padding: 10px;
    }
    .header {
        background-color: #2f2f36;
        color: rgb(211, 211, 211);
        display: flex;
        justify-content: space-between;
    }
    .logout {
        width: 130px;
        height: 50px;
        margin: 5px;
        border: 1px solid rgb(107, 3, 3);
        border-radius: 25px;
        background-color: rgba(227, 23, 23, 0.83);
    }
    .title {
        margin: 5px;
        font-size: xx-large;
        font-weight: bolder;
    }


    .types-panel {
        display: grid;
        overflow-y: auto;
        grid-template-columns: repeat(2,1fr);
        grid-gap: 20px;
        padding: 70px;
        padding-left: 100px;
        padding-right: 100px;
        justify-items: center;
        
    }
    .types-button {
        width: 345px;
        height: 175px;

        background-color: #800020;
        color: rgb(186, 186, 186);
        font-size: xx-large;
        font-weight: 500;
        border-radius: 8px;
        text-decoration: none;
        transition: color 100ms;
        touch-action: manipulation;
    }
    .types-button:nth-child(5) {
        grid-column: span 2;
    }
    .types-button:hover, .types-button:focus {
        background-color: #753343;
    }
    .items-panel {
        display: flex;
        flex-direction: column;
        padding-bottom: 10px;
        overflow-y: auto;
    }


    .sides {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 70px;
    }
    .proteins {
        display: flex;
        flex-wrap: wrap;
    }
    .sides-button, .proteins-button, .extras-button {
        width: 175px;
        height: 130px;
        margin: 5px;
        color: #DAD4B5;
        border-radius: 10px;
    }
    .sides-button:hover {
        background-color: #95917c;
        transition: color 100ms;
    }
    .proteins-button:hover {
        background-color: #691d13;
        transition: color 100ms;
    }
    .extras-button:hover {
        background-color: #530101;
        transition: color 100ms;
    }
    .sides-button {
        color: black;
        background-color: #DAD4B5;
    }
    .proteins-button {
        background-color: #982B1C;
    }
    .extras-button {
        background-color: #800000;
    }

    .order-panel {
        max-height: 100vh;
        margin: 15px;
        padding-bottom: 10px;
        width: 40%;
        display: flex;
        flex-direction: column;
        background-color: #1b1b1f;

        border-radius: 10px;
    }
    .order-header {
        padding-top: 15px;
        font-size: xx-large;
        font-weight: bold;
        background-color: #2f2f36;
        border-bottom: 3px solid black;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
        
        display: flex;
        justify-content: center;
    }


    .checkout {
        background-color: #2f2f36;
        color: rgb(198, 198, 198);
        height: 1000px;
        max-height: 70%;
        font-size: large;
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 25px;
        overflow-y:scroll;
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
    }
    .totals {
        padding: 10px;
        padding-left: 20px;
        font-size: x-large;
        font-weight: bold;
        background-color: #2f2f36;
        
        margin-top: 20px;
        border-radius: 15px;
        color: rgb(214, 214, 214);
        /* border-top: 3px solid black;
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px; */
    }
    .checkout-options {
        display: flex;
        justify-content: space-around;
        margin: 10px;
    }
    .checkout-button, .clear-button {
        width: 200px;
        height: 100px;
        border-radius: 10px;
    }
    .checkout-button {
        background-color: rgb(26, 112, 26);
    }
    .clear-button {
        background-color: rgb(207, 0, 0);
    }

    .checkout-item {
        width: 100%;
    }
    .item-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .item-name{
        flex: 1;
        text-align: left;
    }
    .right-side {
        display: flex;
        align-items: center;
        gap: 40px;
        padding-right: 20px;
    }
    .item-price {
        align-items: right;
    }
    .delete-meal {
        height: 2%;
        width: 10%;
        vertical-align:bottom;
    }




</style>