import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/**
 * En dev (useSubdomain: false) el backend no puede inferir el municipio
 * desde el subdominio, así que se lo enviamos en el header X-Municipio-Slug.
 * El slug se extrae del path actual: /public/:slug/...
 */
export const publicSlugInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.useSubdomain) return next(req);
  if (!req.url.includes('/api/v1/public/')) return next(req);

  const match = window.location.pathname.match(/^\/public\/([^/]+)/);
  const slug = match?.[1];
  if (!slug) return next(req);

  return next(req.clone({ setHeaders: { 'X-Municipio-Slug': slug } }));
};
