import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEnvelope, heroArrowLeft } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-olvide-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIconComponent],
  viewProviders: [provideIcons({ heroEnvelope, heroArrowLeft })],
  templateUrl: './olvide-password.html',
  styleUrl: './olvide-password.css'
})
export class OlvidePasswordComponent {
  correo: string = '';
  estaCargando: boolean = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(private authService: AuthService) {}

  solicitarRecuperacion() {
    if (!this.correo) {
      this.mensajeError = 'Por favor, ingrese su correo electrónico.';
      return;
    }

    this.estaCargando = true;
    this.mensajeError = null;
    this.mensajeExito = null;

    this.authService.solicitarRecuperacion(this.correo).subscribe({
      next: (res) => {
        this.estaCargando = false;
        this.mensajeExito = res.message; // "Si el correo existe..."
        this.correo = ''; // Limpiamos el input
      },
      error: (err) => {
        this.estaCargando = false;
        this.mensajeError = err.error?.error || 'Ocurrió un error. Intente nuevamente.';
      }
    });
  }
}