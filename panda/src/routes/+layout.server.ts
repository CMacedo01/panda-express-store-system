// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employees } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm/expressions';

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();
  const email = session?.user?.email;
  let employee = null;

  if (email) {
    const emp = await db
      .select()
      .from(employees)
      .where(eq(employees.email, email))
      .limit(1);

    if (emp.length > 0) {
      employee = emp[0];
    }
  }

  return {
    session,
    employee,
  };
};
