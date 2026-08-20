import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id_usuario: string;
  nombre: string;
  correo: string;
  rol: 'Administrador' | 'Abogado' | 'Paralegal' | 'Cliente';
  estado: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: User;
}

export interface MensajeResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(!!this.getToken());

  constructor(private http: HttpClient) {}

  login(credentials: { correo: string; contrasena: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          this.saveSession(response.token, response.usuario);
        }
      })
    );
  }

  solicitarRecuperacion(correo: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.apiUrl}/olvide-password`, { correo });
  }

  restablecerPassword(token: string, nuevaContrasena: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.apiUrl}/reset-password`, { token, nuevaContrasena });
  }

  // ────────────────────────────────────────────────────────

  saveSession(token: string, usuario: User): void {
    localStorage.setItem('sgej_token', token);
    localStorage.setItem('sgej_user', JSON.stringify(usuario));
    this.currentUser.set(usuario);
    this.isAuthenticated.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem('sgej_token');
  }

  getUser(): User | null {
    return this.currentUser();
  }

  logout(): void {
    localStorage.removeItem('sgej_token');
    localStorage.removeItem('sgej_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('sgej_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}