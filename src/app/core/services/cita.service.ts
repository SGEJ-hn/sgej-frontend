import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cita {
  id_cita?: string;
  id_expediente?: string | null;
  titulo: string;
  tipo_cita: string;
  lugar_sala: string;
  fecha: string;
  hora_inicio: string;
  duracion_estimada: string;
  notas_recordatorio?: string;
  recordatorio_automatico: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private readonly apiUrl =
    `${environment.apiUrl}/citas`;

  constructor(
    private http: HttpClient
  ) {}


  // Obtener token
  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('sgej_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  // Obtener citas
  obtenerCitas(): Observable<Cita[]> {

    return this.http.get<Cita[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Obtener cita por ID
  obtenerCitaPorId(
    id: string
  ): Observable<Cita> {

    return this.http.get<Cita>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Crear cita
  crearCita(
    cita: Cita
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      cita,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Actualizar cita
  actualizarCita(
    id: string,
    cita: Partial<Cita>
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      cita,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Eliminar cita
  eliminarCita(
    id: string
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

}