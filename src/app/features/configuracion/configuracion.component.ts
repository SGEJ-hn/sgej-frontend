import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // 👈 Importamos Location
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedHeader } from '../../shared/components/shared-header/shared-header';
import { ConfiguracionService, ConfiguracionSistema } from '../../core/services/configuracion.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroBuildingLibrarySolid, 
  heroShieldCheckSolid, 
  heroCheckCircleSolid, 
  heroXCircleSolid, 
  heroCheckSolid,
  heroArrowLeftSolid // 👈 Importamos el icono de la flecha
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedHeader, NgIconComponent],
  viewProviders: [
    provideIcons({ 
      heroBuildingLibrarySolid, 
      heroShieldCheckSolid, 
      heroCheckCircleSolid, 
      heroXCircleSolid,
      heroCheckSolid,
      heroArrowLeftSolid // 👈 Proveemos el icono
    })
  ],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export class ConfiguracionComponent implements OnInit {
  form!: FormGroup;
  cargando = true;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  tabActual: 'informacion' | 'seguridad' = 'informacion';

  constructor(
    private fb: FormBuilder,
    private configService: ConfiguracionService,
    private cdr: ChangeDetectorRef,
    private location: Location // 👈 Inyectamos Location para el botón Volver
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

  // Método para regresar a la vista anterior
  volver(): void {
    this.location.back();
  }

  cambiarTab(tab: 'informacion' | 'seguridad'): void {
    this.tabActual = tab;
    this.cdr.detectChanges(); 
  }

  cargarConfiguracion(): void {
    this.configService.obtenerConfiguracion().subscribe({
      next: (config: ConfiguracionSistema) => {
        this.form.patchValue(config);
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error al cargar configuración:', err);
        this.mensajeError = 'No se pudo cargar la configuración del sistema.';
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
    });
  }

  guardar(): void {
    // 👈 Nueva lógica de validación
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeError = 'No se puede guardar: revisa que los campos obligatorios (*) estén completos en ambas pestañas.';
      
      // Esto imprimirá en la consola de tu navegador los campos exactos que están fallando
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.warn(`El campo '${key}' es inválido. Errores:`, control.errors);
        }
      });

      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.mensajeError = '';
        this.cdr.detectChanges();
      }, 5000);
      
      return; 
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.detectChanges(); 

    this.configService.actualizarConfiguracion(this.form.value).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.message || 'Configuración guardada exitosamente.';
        this.guardando = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.mensajeExito = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        this.mensajeError = 'Ocurrió un error al guardar la configuración.';
        this.guardando = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.mensajeError = '';
          this.cdr.detectChanges();
        }, 4000);
      },
    });
  }
}