import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedHeader } from '../../../shared/components/shared-header/shared-header';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedHeader, NgIconComponent],
  viewProviders: [provideIcons({ heroArrowLeft })],
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css',
})
export class CrearUsuarioComponent {
  form: FormGroup;
  guardando = false;
  mensajeError = '';
  mostrarContrasena = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      rol: ['', Validators.required],
      estado: ['Activo', Validators.required],
    });
  }

  toggleContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    this.usuarioService.crearUsuario(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/usuarios']);
      },
      error: (err: any) => {
        this.mensajeError = err.error?.error || 'Error al crear el usuario.';
        this.guardando = false;
      },
    });
  }
}
