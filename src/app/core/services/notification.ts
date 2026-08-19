import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// 1. Definimos las interfaces para que TypeScript nos ayude con el autocompletado
export interface Notificacion {
  id_notificacion: string;
  id_usuario: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  enlace_referencia?: string;
  fecha_creacion: string;
}

export interface NotificacionResponse {
  sinLeer: number;
  notificaciones: Notificacion[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Ajusta esta URL si tu backend corre en otro puerto
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  // 2. Estado reactivo para el contador de notificaciones sin leer
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las notificaciones del usuario y actualiza el contador global
   */
  getMisNotificaciones(): Observable<NotificacionResponse> {
    return this.http.get<NotificacionResponse>(this.apiUrl).pipe(
      tap((response) => {
        // Actualizamos el contador automáticamente cuando llegan los datos
        this.unreadCountSubject.next(response.sinLeer);
      })
    );
  }

  /**
   * Marca una notificación como leída en la base de datos y resta 1 al contador
   */
  marcarComoLeida(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/leer`, {}).pipe(
      tap(() => {
        // Si la petición fue exitosa, restamos 1 al globito rojo visualmente
        const actual = this.unreadCountSubject.value;
        if (actual > 0) {
          this.unreadCountSubject.next(actual - 1);
        }
      })
    );
  }

 // En tu NotificationService
  marcarTodasComoLeidas(): Observable<any> {
    // Le quitamos el '/notificaciones' extra y reseteamos el contador
    return this.http.put(`${this.apiUrl}/marcar-todas`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }
}
