import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InventarioItem,
  InventarioItemCreateDto,
  InventarioItemUpdateDto,
  Programa,
  DashboardInventario,
} from '../models/inventario.model';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private http = inject(HttpClient);

  /**
   * Obtener lista de items de inventario
   */
  getItems(): Observable<InventarioItem[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_INVENTARIO_ITEMS_LIST}`;
    return this.http.get<InventarioItem[]>(url);
  }

  /**
   * Obtener un item por ID
   */
  getItem(id: string): Observable<InventarioItem> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.DIF_INVENTARIO_ITEMS_GET}`.replace(
        ':id',
        id,
      );
    return this.http.get<InventarioItem>(url);
  }

  /**
   * Crear un nuevo item
   */
  createItem(item: InventarioItemCreateDto): Observable<InventarioItem> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_INVENTARIO_ITEMS_CREATE}`;
    return this.http.post<InventarioItem>(url, item);
  }

  /**
   * Actualizar un item existente
   */
  updateItem(
    id: string,
    item: InventarioItemUpdateDto,
  ): Observable<InventarioItem> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.DIF_INVENTARIO_ITEMS_UPDATE}`.replace(
        ':id',
        id,
      );
    return this.http.patch<InventarioItem>(url, item);
  }

  /**
   * Eliminar un item
   */
  deleteItem(id: string): Observable<void> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.DIF_INVENTARIO_ITEMS_DELETE}`.replace(
        ':id',
        id,
      );
    return this.http.delete<void>(url);
  }

  /**
   * Obtener datos del dashboard
   */
  getDashboard(): Observable<DashboardInventario> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_INVENTARIO_DASHBOARD}`;
    return this.http.get<DashboardInventario>(url);
  }

  /**
   * Obtener lista de programas DIF
   */
  getProgramas(): Observable<Programa[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_PROGRAMAS_LIST}`;
    return this.http.get<Programa[]>(url);
  }
}
