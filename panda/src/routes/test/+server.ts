export async function POST({ request }) {
    const data = await request.json();
    console.log('Received POST data:', data);
    return new Response(JSON.stringify({ success: true }));
}

// export async function POST({ request }) {
//     const data = await request.json();
//     const { order_time, subtotal, orderMeals } = data;

//     console.log('Reached post request');

//     // Log the order insertion SQL command
//     console.log(`INSERT INTO orders (order_time, subtotal) VALUES ('${order_time}', ${subtotal}) RETURNING id`);

//     const orderId = { id: 1 }; // Mock order ID for testing
//     console.log(orderMeals);
//     for (const meal of orderMeals) {
//         const { meal_type_id, meal_items } = meal;

//         // Log the meal insertion SQL command
//         console.log(`INSERT INTO meals (meal_type_id, order_id) VALUES (${meal_type_id}, ${orderId.id}) RETURNING id`);

//         const mealId = { id: 1 }; // Mock meal ID for testing
//         console.log(meal_items);
//         for (const item of meal_items) {
//             // Log the menu item selection SQL command
//             console.log(`SELECT id FROM menu_items WHERE name = '${item.name}' LIMIT 1`);

//             const menuItemId = 1; // Mock menu item ID for testing

//             // Log the meal item insertion SQL command
//             console.log(`INSERT INTO meal_items (menu_item_id, meal_id) VALUES (${menuItemId}, ${mealId.id})`);
//         }
//         console.log('Finished order');
//     }
//     return new Response(JSON.stringify({ success: true }));
// }