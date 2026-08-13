import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConfiguracionSistema {
  id_configuracion: string;
  nombre_bufete: string;
  cedula_rtn: string;
  sitio_web: string | null;
  telefono: string | null;
  correo_electronico: string | null;
  direccion: string | null;
  descripcion_bufete: string | null;
  notificaciones_push: boolean;
  recordatorios_audiencias: boolean;
  tiempo_inactividad_min: number;
  longitud_min_contrasena: number;
  intentos_max_login: number;
  duracion_bloqueo_min: number;
  requerir_2fa: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  private readonly apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  obtenerConfiguracion(): Observable<ConfiguracionSistema> {
    return this.http.get<ConfiguracionSistema>(this.apiUrl);
  }

  actualizarConfiguracion(data: Partial<ConfiguracionSistema>): Observable<{ message: string; configuracion: ConfiguracionSistema }> {
    return this.http.put<{ message: string; configuracion: ConfiguracionSistema }>(this.apiUrl, data);
  }
}
