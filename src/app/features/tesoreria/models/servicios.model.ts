export type CategoriaServicio = string;

export interface ServicioCobrable {
  _id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaServicio;
  areaResponsable: string;
  costo: number;
  montoVariable: boolean;
  activo: boolean;
  municipioId: string | null;
  esPersonalizado: boolean;
  requiereContribuyente: boolean;
  orden: number;
}

export interface HasOverridesResponse {
  hasOverrides: boolean;
  total: number;
}

export interface CatalogoServiciosResponse {
  categorias: CategoriaServicio[];
}

export interface ServiciosQueryParams {
  busqueda?: string;
  categoria?: CategoriaServicio | '';
  soloPersonalizados?: boolean;
}

export interface OverrideDto {
  costo?: number;
  nombre?: string;
  montoVariable?: boolean;
  activo?: boolean;
}

export interface DeleteOverridesResponse {
  eliminados: number;
}
