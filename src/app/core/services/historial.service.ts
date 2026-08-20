import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EventoHistorial {
  id_historial: string;
  id_expediente: string;
  id_autor: string;
  categoria_evento: 'Audiencias' | 'Documentos' | 'Resoluciones' | 'Escritos' | 'Expediente';
  titulo_evento: string;
  descripcion: string;
  fecha_modificacion: string;
  autor?: {
    id_usuario: string;
    nombre: string;
    rol: string;
  };
}

export interface RespuestaHistorial {
  total: number;
  historial: EventoHistorial[];
  numero_expediente?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = `${environment.apiUrl}/historial`;

  constructor(private http: HttpClient) {}

  obtenerHistorial(idExpediente: string, categoria: string = 'Todos', page: number = 1, limit: number = 10) {
    let params = new HttpParams()
      .set('categoria', categoria)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/expediente/${idExpediente}`, { params });
  }
}