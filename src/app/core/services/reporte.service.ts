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

  // 1. Usamos la variable del environment en lugar del texto fijo
  private apiUrl = `${environment.apiUrl}/reportes/estadisticas`;

  constructor(
    private http: HttpClient
  ) {}

  // ─────────────────────────────────────────
  // Obtener estadísticas generales
  // ─────────────────────────────────────────
  obtenerEstadisticas(): Observable<EstadisticasReportes> {
    return this.http.get<EstadisticasReportes>(this.apiUrl);
  }
}