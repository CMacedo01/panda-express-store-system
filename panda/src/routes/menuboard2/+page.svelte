<script lang="ts">
    let placeholderImgURL = "/assets/placeholder.jfif";
    let familyMealImgURL = "/assets/family_meal.jpg";
    let biggerPlateImgURL = "/assets/bigger_plate.png";

    let colorYellow = "#ffffff";
    let colorMaroon = "#3f0505";

    let mealTypeStyle = "text-6xl font-bold animate-bounce";
    let ingStyle = "font-bold";
    let calStyle = "";
</script>

<div class="flex object-cover max-h-screen max-w-screen min-h-screen min-w-screen grid grid-rows-2" style="background-color: {colorMaroon}">
    <!-- <img src={placeholderImgURL} alt="placeholder image" class="">
    <p>asdfasfd</p>
    <p>bruhsafjl</p>
    <img src={placeholderImgURL} alt="placeholder image" class="w-1/2"> -->

    <div class="flex">
        <img src={familyMealImgURL} alt="Family meal withsuper extra mild chicken, black pepper sirloin steak and super extra ordinary beef in fried rice and super greens. 5000 calories" class="w-1/2">
        <div class="w-1/2 flex flex-col justify-center">
            <p class={mealTypeStyle} style="color: {colorYellow}">FAMILY MEAL</p>
            <p class={ingStyle} style="color: {colorYellow}">Super Extra Mild Chicken + Black Pepper Sirloin Steak + Super Extra Ordinary Beef</p>
            <p class={ingStyle} style="color: {colorYellow}">Fried Rice + Super Greens</p>
            <p class={calStyle} style="color: {colorYellow}">5000 calories</p>
        </div>
    </div>
    <div class="flex">
        <div class="w-1/2 flex flex-col justify-center text-right">
            <p class={mealTypeStyle} style="color: {colorYellow}">BIGGER PLATE</p>
            <p class={ingStyle} style="color: {colorYellow}">Super Extra Spicy Chicken + Honey Walnut Shrimp + Super Extra Ordinary Beef</p>
            <p class={ingStyle} style="color: {colorYellow}">Fried Rice</p>
            <p class={calStyle} style="color: {colorYellow}">4000 calories</p>
        </div>
        <img src={biggerPlateImgURL} alt="placeholder image" class="w-1/2">
    </div>
</div>
