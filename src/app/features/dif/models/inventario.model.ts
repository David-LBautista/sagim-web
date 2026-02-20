export enum TipoItem {
  DESPENSA = 'DESPENSA',
  MEDICAMENTO = 'MEDICAMENTO',
  ROPA = 'ROPA',
  UTENSILIO = 'UTENSILIO',
  MOBILIARIO = 'MOBILIARIO',
  EQUIPO = 'EQUIPO',
  OTRO = 'OTRO',
}

export interface InventarioItem {
  _id: string;
  programaId: {
    _id: string;
    nombre: string;
    descripcion?: string;
  };
  tipo: TipoItem;
  cantidad: number;
  concepto: string;
  fecha: string;
  comprobante: string;
  observaciones?: string;
  valorUnitario: number;
  valorTotal?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventarioItemCreateDto {
  programaId: string;
  tipo: TipoItem;
  cantidad: number;
  concepto: string;
  fecha: string;
  comprobante: string;
  observaciones?: string;
  valorUnitario: number;
}

export interface InventarioItemUpdateDto {
  programaId?: string;
  tipo?: TipoItem;
  cantidad?: number;
  concepto?: string;
  fecha?: string;
  comprobante?: string;
  observaciones?: string;
  valorUnitario?: number;
  activo?: boolean;
}

export interface Programa {
  _id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface StockCriticoItem {
  id: string;
  tipo: TipoItem;
  programa: {
    id: string;
    nombre: string;
  };
  stockActual: number;
  alertaMinima: number;
  porcentajeStock: number;
  estado: 'CRITICO' | 'BAJO' | 'NORMAL';
  unidadMedida: string;
  valorUnitario: number;
}

export interface MovimientoReciente {
  id: string;
  fecha: string;
  tipoMovimiento: 'IN' | 'OUT';
  tipo: TipoItem;
  programa: {
    id: string;
    nombre: string;
  };
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  concepto: string;
  responsable: {
    nombre: string;
    email: string;
  };
  folio: string;
  apoyoFolio: string | null;
  comprobante: string;
}

export interface DashboardInventario {
  resumen: {
    totalItems: number;
    valorTotalInventario: number;
  };
  stockCritico: {
    total: number;
    items: StockCriticoItem[];
  };
  movimientosDelMes: {
    entradas: {
      totalMovimientos: number;
      cantidadTotal: number;
    };
    salidas: {
      totalMovimientos: number;
      cantidadTotal: number;
    };
    balance: number;
    ultimosMovimientos: MovimientoReciente[];
  };
  actividadReciente?: MovimientoReciente[];
}
