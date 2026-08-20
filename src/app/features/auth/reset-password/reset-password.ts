import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroKey, heroCheckCircle } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIconComponent],
  viewProviders: [provideIcons({ heroKey, heroCheckCircle })],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  
  estaCargando: boolean = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Leemos el token de la URL (ej: /restablecer-password?token=XYZ)
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.mensajeError = 'Enlace inválido. No se detectó el token de seguridad.';
    }
  }

  restablecer() {
    if (this.nuevaContrasena.length < 8) {
      this.mensajeError = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.token) return;

    this.estaCargando = true;
    this.mensajeError = null;

    this.authService.restablecerPassword(this.token, this.nuevaContrasena).subscribe({
      next: (res) => {
        this.estaCargando = false;
        this.mensajeExito = res.message;
        // Redirigir al login después de 3 segundos
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.estaCargando = false;
        this.mensajeError = err.error?.error || 'Ocurrió un error al cambiar la contraseña.';
      }
    });
  }
}