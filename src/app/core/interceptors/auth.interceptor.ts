import { HttpInterceptorFn } from '@angular/common/http';

/** Añade la sesión guardada a las solicitudes protegidas del API. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('sgej_token');

  if (!token || request.headers.has('Authorization')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
