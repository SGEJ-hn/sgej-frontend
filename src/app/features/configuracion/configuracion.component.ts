import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedHeader } from '../../shared/components/shared-header/shared-header';
import { ConfiguracionService, ConfiguracionSistema } from '../../core/services/configuracion.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedHeader],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export class ConfiguracionComponent implements OnInit {
  form!: FormGroup;
  cargando = true;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private fb: FormBuilder,
    private configService: ConfiguracionService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre_bufete: ['', Validators.required],
      cedula_rtn: ['', Validators.required],
      sitio_web: [''],
      telefono: [''],
      correo_electronico: ['', Validators.email],
      direccion: [''],
      descripcion_bufete: [''],
      notificaciones_push: [true],
      recordatorios_audiencias: [true],
      tiempo_inactividad_min: [30, [Validators.required, Validators.min(1), Validators.max(480)]],
      longitud_min_contrasena: [10, [Validators.required, Validators.min(6), Validators.max(50)]],
      intentos_max_login: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
      duracion_bloqueo_min: [15, [Validators.required, Validators.min(1), Validators.max(1440)]],
      requerir_2fa: [false],
    });

    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.configService.obtenerConfiguracion().subscribe({
      next: (config: ConfiguracionSistema) => {
        this.form.patchValue(config);
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar configuración:', err);
        this.mensajeError = 'No se pudo cargar la configuración del sistema.';
        this.cargando = false;
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.configService.actualizarConfiguracion(this.form.value).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.message || 'Configuración guardada exitosamente.';
        this.guardando = false;
        setTimeout(() => (this.mensajeExito = ''), 4000);
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        this.mensajeError = 'Ocurrió un error al guardar la configuración.';
        this.guardando = false;
        setTimeout(() => (this.mensajeError = ''), 4000);
      },
    });
  }
}
