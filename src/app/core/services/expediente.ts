import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expediente {
  id_expediente: string;
  numero_expediente: string;
  id_cliente: string;
  materia: string;
  estado: string;
  tribunal_juzgado: string;
  juez_cargo?: string;
  cuantia_litigio?: number | string;
  fecha_apertura: string;
  descripcion_hechos: string;

  cliente?: {
    id_usuario: string;
    nombre: string;
    correo: string;
  };

  equipo?: {
    id_usuario?: string;
    user?: {
      id_usuario: string;
      nombre: string;
      rol: string;
    };
  }[];
}

export interface ExpedientesResponse {
  total: number;
  expedientes: Expediente[];
}

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {

  private apiUrl = `${environment.apiUrl}/expedientes`;

  constructor(private http: HttpClient) {}

  // Obtener todos los expedientes
  obtenerExpedientes(): Observable<ExpedientesResponse> {
    return this.http.get<ExpedientesResponse>(this.apiUrl);
  }

  // Obtener un expediente por ID
  obtenerExpediente(id: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.apiUrl}/${id}`);
  }

  // Obtener un expediente por ID
  // Mantiene compatibilidad con el código anterior del equipo
  obtenerExpedientePorId(id: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.apiUrl}/${id}`);
  }

  // Crear un expediente
  crearExpediente(expediente: Expediente): Observable<Expediente> {
    return this.http.post<Expediente>(this.apiUrl, expediente);
  }

  // Actualizar un expediente
  actualizarExpediente(
    id: string,
    expediente: Partial<Expediente>
  ): Observable<Expediente> {
    return this.http.put<Expediente>(
      `${this.apiUrl}/${id}`,
      expediente
    );
  }

  // Eliminar un expediente
  eliminarExpediente(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

