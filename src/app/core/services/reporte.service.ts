import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─────────────────────────────────────────────
// Interfaces para las estadísticas
// ─────────────────────────────────────────────

export interface EstadisticaAgrupada {
  estado?: string;
  materia?: string;
  tipo_cita?: string;
  rol?: string;

  _count: {
    id_expediente?: number;
    id_cita?: number;
    id_usuario?: number;
  };
}

export interface EstadisticasReportes {
  totalExpedientes: number;
  expedientesPorEstado: EstadisticaAgrupada[];
  expedientesPorMateria: EstadisticaAgrupada[];
  citasPorTipo: EstadisticaAgrupada[];
  usuariosPorRol: EstadisticaAgrupada[];
  totalDocumentos: number;
}

// ─────────────────────────────────────────────
// Servicio de Reportes
// ─────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private readonly apiUrl =
    `${environment.apiUrl}/reportes`;

  constructor(
    private http: HttpClient
  ) {}

  // ─────────────────────────────────────────
// Obtener estadísticas generales
// ─────────────────────────────────────────

obtenerEstadisticas(): Observable<EstadisticasReportes> {

  // Se agrega una marca de tiempo para evitar
  // que el navegador utilice una respuesta almacenada
  // en caché y asegurarnos de obtener los datos actuales.

  return this.http.get<EstadisticasReportes>(
    `${this.apiUrl}/estadisticas?t=${Date.now()}`
  );

}
}