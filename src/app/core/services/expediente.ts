import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Es buena práctica definir una interfaz básica basada en tu base de datos
export interface Expediente {
  id_expediente: string;
  numero_expediente: string;
  id_cliente: string;
  materia: string;
  estado: string;
  tribunal_juzgado: string;
  juez_cargo?: string;
  cuantia_litigio?: number;
  fecha_apertura: string;
  descripcion_hechos: string;
}


@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {
  
  // 🌟 IMPORTANTE: Ajusta esta URL al puerto y ruta real de tu backend
  private apiUrl = 'http://localhost:3000/api/expedientes'; 

  constructor(private http: HttpClient) { }

  // 1. OBTENER TODOS (GET)
  obtenerExpedientes(): Observable<Expediente[]> {
    return this.http.get<Expediente[]>(this.apiUrl);
  }

  // 2. OBTENER POR ID (GET)
  obtenerExpedientePorId(id: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.apiUrl}/${id}`);
  }

  // 3. CREAR NUEVO (POST)
  crearExpediente(expediente: Expediente): Observable<Expediente> {
    return this.http.post<Expediente>(this.apiUrl, expediente);
  }

  // 4. ACTUALIZAR (PUT)
  actualizarExpediente(id: string, expediente: Partial<Expediente>): Observable<Expediente> {
    return this.http.put<Expediente>(`${this.apiUrl}/${id}`, expediente);
  }

  // 5. ELIMINAR (DELETE)
  eliminarExpediente(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}