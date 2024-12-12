// src/lib/authGuard.ts
export function authGuard(
  session: import('@auth/sveltekit').Session | null,
  employee: {
    id: number;
    firstname: string;
    email: string;
    lastname: string;
    is_hired: boolean;
    is_manager: boolean;
    is_signed_in: boolean;
  } | null,
  currentPath: string
): { status: number; location: string } | null {
  if (!session?.user?.email) {
    if (currentPath !== '/') {
      return { status: 302, location: '/?message=not-authenticated' };
    }
    return null;
  }

  if (!employee) {
    if (currentPath !== '/') {
      return { status: 302, location: '/?message=not-registered' };
    }
    return null;
  }

  if (!employee.is_hired) {
    if (currentPath !== '/') {
      return { status: 302, location: '/?message=not-hired' };
    }
    return null;
  }

  if (!employee.is_manager) {
    if (currentPath !== '/cashier') {
      return { status: 302, location: '/cashier' };
    }
    return null;
  }

  return null;
}
