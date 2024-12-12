import { writable } from 'svelte/store';

// Store to manage user role (null, 'manager', or 'employee')
export const userRole = writable<'manager' | 'employee' | null>(null);
