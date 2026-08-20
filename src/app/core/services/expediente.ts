import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClienteExpediente {
  id_usuario?: string;
  nombre: string;
  correo: string;
}

export interface UsuarioEquipo {
  id_usuario?: string;
  nombre: string;
  correo?: string;
  rol?: string;
}

export interface ExpedienteEquipo {
  id_usuario?: string;
  rol_en_caso?: string;
  user?: UsuarioEquipo;
  usuario?: UsuarioEquipo; 
}

export interface ParteInvolucrada {
  clasificacion: string;
  tipo_persona: string;
  nombre_completo: string;
  identificacion?: string;
  correo_contacto?: string;
  direccion?: string;
}

export interface Expediente {
  id_expediente?: string;
  numero_expediente: string;
  id_cliente?: string;
  materia: string;
  estado: string;
  tribunal_juzgado: string;
  juez_cargo?: string;
  cuantia_litigio?: number;
  fecha_apertura: string;
  descripcion_hechos: string;

  // JOINs
  cliente?: ClienteExpediente;  
  equipo?: ExpedienteEquipo[];
  partes_involucradas?: ParteInvolucrada[];
  partes?: ParteInvolucrada[];
  proxima_cita?: string;
}

export interface ExpedientesResponse {
  total: number;
  total_paginas?: number;
  expedientes: Expediente[];
}

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {

  private apiUrl = `${environment.apiUrl}/expedientes`;

  constructor(private http: HttpClient) {}

  // ✅ ACTUALIZADO: Soporte para paginación y búsqueda en el servidor
  obtenerExpedientes(page: number = 1, limit: number = 8, search: string = ''): Observable<ExpedientesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim() !== '') {
      params = params.set('buscar', search);
    }

    return this.http.get<ExpedientesResponse>(this.apiUrl, { params });
  }

  obtenerExpediente(id: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.apiUrl}/${id}`);
  }

  obtenerExpedientePorId(id: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.apiUrl}/${id}`);
  }

  crearExpediente(expediente: Expediente): Observable<Expediente> {
    return this.http.post<Expediente>(this.apiUrl, expediente);
  }

  actualizarExpediente(
    id: string,
    expediente: Partial<Expediente>
  ): Observable<Expediente> {
    return this.http.put<Expediente>(
      `${this.apiUrl}/${id}`,
      expediente
    );
  }

  eliminarExpediente(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}