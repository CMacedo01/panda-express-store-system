import { db } from '$lib/server/db';
import { menuItems, orders, meals, mealItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm/mysql-core/expressions';

export async function POST({ request }) {
    const data = await request.json();
    const { subtotal, orderMeals } = data;
    const order_time = new Date(); // Ensure this is a valid ISO string

    console.log("Current order meals: " + JSON.stringify(orderMeals));
    console.log("Subtotal: " + subtotal);
    console.log("Order time: " + order_time);

    // Insert the order and get the order ID
    const [orderId] = await db.insert(orders).values({
        order_time,
        subtotal,
        is_delivered: false
    }).returning({ id: orders.id });

    for (const meal of orderMeals) {
        const { meal_type_id, meal_items } = meal;

        console.log(`Inserting meal with meal_type_id: ${meal_type_id}, order_id: ${orderId.id}`);

        const [mealId] = await db.insert(meals).values({
            meal_type_id,
            order_id: orderId.id
        }).returning({ id: meals.id });

        for (const item of meal_items) {
            const menuItem = await db.select({ id: menuItems.id })
                .from(menuItems)
                .where(eq(menuItems.name, item))
                .limit(1);
            const menuItemId = menuItem[0]?.id;

            if (menuItemId === undefined) {
                console.error(`Menu item not found for item: ${item}`);
                continue;
            }

            console.log(`Inserting meal item with menu_item_id: ${menuItemId}, meal_id: ${mealId.id}`);

            await db.insert(mealItems).values({
                menu_item_id: menuItemId,
                meal_id: mealId.id
            });
        }
    }

    return new Response(JSON.stringify({ success: true }));
}