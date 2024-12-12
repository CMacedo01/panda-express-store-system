import { db } from '$lib/server/db'
import { or, sql } from 'drizzle-orm'
import { mealTypes, menuItems, promoCodes } from '$lib/server/db/schema'

export async function load() {
    const allMenuItemsviaORM = await db.select().from(menuItems); 
    const allMenuTypesviaORM = await db.select().from(mealTypes);
    const allPromoCodes = await db.select().from(promoCodes);
    return {
        menuItems : allMenuItemsviaORM,
        mealTypes : allMenuTypesviaORM,
        promoCodes : allPromoCodes
    }
}
