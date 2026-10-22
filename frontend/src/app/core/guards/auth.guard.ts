import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Equivalente a PrivateRoute.jsx: exige sesion activa y, opcionalmente, un rol permitido
// declarado en la ruta como data: { roles: ['Medico'] }
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const rolesPermitidos = route.data?.['roles'] as string[] | undefined;
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
