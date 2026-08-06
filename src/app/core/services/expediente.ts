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

  // Método para traer todos los expedientes
  obtenerExpedientes(): Observable<Expediente[]> {
    return this.http.get<Expediente[]>(this.apiUrl);
  }
}