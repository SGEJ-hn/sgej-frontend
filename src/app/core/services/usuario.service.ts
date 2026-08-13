import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
  ultimo_acceso: string | null;
}

export interface CrearUsuarioDto {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  obtenerUsuarios(filtros?: { rol?: string; estado?: string; busqueda?: string }): Observable<Usuario[]> {
    let params = new HttpParams();
    if (filtros?.rol) params = params.set('rol', filtros.rol);
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.busqueda) params = params.set('busqueda', filtros.busqueda);

    return this.http.get<Usuario[]>(this.apiUrl, { params });
  }

  obtenerUsuarioPorId(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(data: CrearUsuarioDto): Observable<{ message: string; usuario: Usuario }> {
    return this.http.post<{ message: string; usuario: Usuario }>(this.apiUrl, data);
  }

  actualizarUsuario(id: string, data: Partial<CrearUsuarioDto>): Observable<{ message: string; usuario: Usuario }> {
    return this.http.put<{ message: string; usuario: Usuario }>(`${this.apiUrl}/${id}`, data);
  }

  eliminarUsuario(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
