import { db } from '$lib/server/db'
import { eq, lt, gte, ne } from 'drizzle-orm';
import { sql } from 'drizzle-orm'
import { menuItems } from '$lib/server/db/schema'
import { mealTypes } from '$lib/server/db/schema'

/**
 * Loads database information for different menu items and meal types
 * @returns menuItemsEntree, menuItemsSide, menuItemsExtra, menuMealTypes
 */
export async function load() {
    // const allMenuItemsviaORM = await db.select({ name: menuItems.name }).from(menuItems); // Understand this better
    const allMenuItemsEntree = await db.select().from(menuItems).where(eq(menuItems.type, "entree")); // Understand this better
    const allMenuItemsSide = await db.select().from(menuItems).where(eq(menuItems.type, "side"));
    const allMenuItemsExtra = await db.select().from(menuItems).where(eq(menuItems.type, "extra"));
    const allMealTypes = await db.select().from(mealTypes)
    // console.log("Entrees" + JSON.stringify(allMenuItemsEntree) + "\n\n");
    // console.log("Sides" + JSON.stringify(allMenuItemsSide));
    return {
        menuItemsEntree : allMenuItemsEntree,
        menuItemsSide : allMenuItemsSide,
        menuItemsExtra : allMenuItemsExtra,
        menuMealTypes : allMealTypes
    }
}