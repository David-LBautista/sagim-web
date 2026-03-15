import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  TransparenciaResponse,
  TransparenciaSeccion,
  ResumenCumplimiento,
  AgregarDocumentoDto,
} from '../models/transparencia.models';

export interface TransparenciaFiltros {
  tipo?: 'comun' | 'municipal';
  estado?: 'al_corriente' | 'con_documentos' | 'sin_documentos';
  area?: string;
  periodo?: 'Trimestral' | 'Anual' | 'Permanente';
}

@Injectable({ providedIn: 'root' })
export class TransparenciaService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  listar(filtros?: TransparenciaFiltros): Observable<TransparenciaResponse> {
    let params = new HttpParams();
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.area) params = params.set('area', filtros.area);
    if (filtros?.periodo) params = params.set('periodo', filtros.periodo);
    return this.http.get<TransparenciaResponse>(
      `${this.base}${ApiEndpoints.TRANSPARENCIA_LIST}`,
      { params },
    );
  }

  cumplimiento(): Observable<ResumenCumplimiento> {
    return this.http.get<ResumenCumplimiento>(
      `${this.base}${ApiEndpoints.TRANSPARENCIA_CUMPLIMIENTO}`,
    );
  }

  getSeccion(clave: string): Observable<TransparenciaSeccion> {
    return this.http.get<TransparenciaSeccion>(
      `${this.base}${ApiEndpoints.TRANSPARENCIA_SECCION.replace(':clave', clave)}`,
    );
  }

  agregarDocumento(
    clave: string,
    dto: AgregarDocumentoDto,
  ): Observable<TransparenciaSeccion> {
    const url = `${this.base}${ApiEndpoints.TRANSPARENCIA_DOCUMENTOS_ADD.replace(':clave', clave)}`;

    if ((dto.tipo === 'pdf' || dto.tipo === 'excel') && dto.archivo) {
      const fd = new FormData();
      fd.append('nombre', dto.nombre);
      fd.append('tipo', dto.tipo);
      if (dto.descripcion) fd.append('descripcion', dto.descripcion);
      if (dto.periodoReferencia)
        fd.append('periodoReferencia', dto.periodoReferencia);
      if (dto.ejercicio) fd.append('ejercicio', dto.ejercicio);
      if (dto.subseccionClave)
        fd.append('subseccionClave', dto.subseccionClave);
      fd.append('archivo', dto.archivo);
      return this.http.post<TransparenciaSeccion>(url, fd);
    }

    return this.http.post<TransparenciaSeccion>(url, dto);
  }

  eliminarDocumento(
    clave: string,
    idx: number,
    subseccionClave?: string | null,
  ): Observable<TransparenciaSeccion> {
    const url = `${this.base}${ApiEndpoints.TRANSPARENCIA_DOCUMENTOS_DELETE.replace(':clave', clave)}`;
    const body: { documentoIndex: number; subseccionClave?: string } = {
      documentoIndex: idx,
    };
    if (subseccionClave) body.subseccionClave = subseccionClave;
    return this.http.delete<TransparenciaSeccion>(url, { body });
  }

  marcarCorriente(
    clave: string,
    alCorriente: boolean,
  ): Observable<TransparenciaSeccion> {
    return this.http.patch<TransparenciaSeccion>(
      `${this.base}${ApiEndpoints.TRANSPARENCIA_CORRIENTE.replace(':clave', clave)}`,
      { alCorriente },
    );
  }

  guardarNota(
    clave: string,
    notaInterna: string,
  ): Observable<TransparenciaSeccion> {
    return this.http.patch<TransparenciaSeccion>(
      `${this.base}${ApiEndpoints.TRANSPARENCIA_NOTA.replace(':clave', clave)}`,
      { notaInterna },
    );
  }
}
