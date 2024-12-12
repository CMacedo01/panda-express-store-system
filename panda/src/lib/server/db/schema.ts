import { pgTable, serial, text, integer, boolean, doublePrecision, timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core';

const menuType = pgEnum('menu_type', ['side', 'entree', 'extra']);

export const employees = pgTable('employees', {
    id: serial('id').primaryKey(),
    firstname: varchar('firstname'),
    email: varchar('email'),
    lastname: varchar('lastname'),
    is_hired: boolean('is_hired'),
    is_manager: boolean('is_manager'),
    is_signed_in: boolean('is_signed_in')
});

export const ingredients = pgTable('ingredients', {
    name: varchar('name').primaryKey(),
    current_amount: integer('current_amount'),
    unit_price: doublePrecision('unit_price'),
    green_threshold: integer('green_threshold'),
    yellow_threshold: integer('yellow_threshold'),
    red_threshold: integer('red_threshold')
});

export const mealItems = pgTable('meal_items', {
    id: serial('id').primaryKey(),
    menu_item_id: integer('menu_item_id').references(() => menuItems.id),
    meal_id: integer('meal_id').references(() => meals.id)
});

export const mealTypes = pgTable('meal_types', {
    id: serial('id').primaryKey(),
    name: varchar('name'),
    price: doublePrecision('price'),
    side_quantity: integer('side_quantity'),
    protein_quantity: integer('protein_quantity')
});

export const meals = pgTable('meals', {
    id: serial('id').primaryKey(),
    meal_type_id: integer('meal_type_id').references(() => mealTypes.id),
    order_id: integer('order_id').references(() => orders.id)
});

export const menuItems = pgTable('menu_items', {
    id: serial('id').primaryKey(),
    type: menuType('type'),
    price_addition: doublePrecision('price_addition'),
    name: varchar('name'),
    calories: integer('calories')
});

export const menuItemIngredients = pgTable('menu_item_ingredients', {
    ingredient_name: varchar('ingredient_name').references(() => ingredients.name),
    menu_item_id: integer('menu_item_id').references(() => menuItems.id)
});

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    order_time: timestamp('order_time'),
    subtotal: doublePrecision('subtotal'),
    is_delivered: boolean('is_delivered').default(true)
});

export const reportLog = pgTable('report_log', {
    id: serial('id').primaryKey(),
    date: timestamp('date')
});

export const promoCodes = pgTable('promo_codes', {
    id: serial('id').primaryKey(),
    discount: doublePrecision('discount'),
    code: varchar('code')
});
