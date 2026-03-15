import { HttpInterceptorFn } from '@angular/common/http';

const RESERVED = ['www', 'app', 'sagim', 'localhost'];

/**
 * Adjunta X-Municipio-Slug a todas las peticiones públicas.
 * En producción se extrae del subdominio (laperla.sagim.com.mx → 'laperla').
 * En dev la URL tiene la forma /public/:slug/... así que se lee del pathname.
 */
export const publicSlugInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/v1/public/')) return next(req);

  const subdomain = window.location.hostname.split('.')[0];
  const slug = RESERVED.includes(subdomain)
    ? window.location.pathname.match(/^\/public\/([^/]+)/)?.[1]
    : subdomain;

  if (!slug) return next(req);

  return next(req.clone({ setHeaders: { 'X-Municipio-Slug': slug } }));
};
