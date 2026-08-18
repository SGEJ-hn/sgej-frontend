import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

export const roleGuard = (roles: User['rol'][]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.getUser();
  if (usuario && roles.includes(usuario.rol)) return true;
  return router.createUrlTree([usuario?.rol === 'Cliente' ? '/cliente' : '/dashboard']);
};
