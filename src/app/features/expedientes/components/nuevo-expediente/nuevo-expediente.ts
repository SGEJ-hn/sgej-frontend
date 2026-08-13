import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-nuevo-expediente',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedHeader
  ],
  templateUrl: './nuevo-expediente.html',
  styleUrl: './nuevo-expediente.css'
})
export class NuevoExpediente implements OnInit {
  private fb = inject(FormBuilder);
  private expedienteService = inject(ExpedienteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  expedienteForm!: FormGroup;
  guardando = false;
  mensajeError = '';
  mensajeExito = '';

  materias = ['Civil', 'Penal', 'Mercantil', 'Laboral', 'Familia', 'Administrativo'];
  estados = ['Abierto', 'En proceso', 'En audiencia', 'Cerrado'];
  tribunales = [
    'Juzgado de Letras de lo Civil',
    'Juzgado de Letras de lo Penal',
    'Juzgado de Familia',
    'Tribunal de Sentencia',
    'Corte de Apelaciones',
    'Juzgado del Trabajo'
  ];

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    const user = this.authService.getUser();

    this.expedienteForm = this.fb.group({
      // Clasificación del Expediente
      numero_expediente: ['', [Validators.required]],
      materia: ['Civil', [Validators.required]],
      estado: ['En proceso', [Validators.required]],
      tribunal_juzgado: ['Juzgado de Letras de lo Civil', [Validators.required]],
      juez_cargo: [''],
      cuantia_litigio: [null],
      fecha_apertura: [today, [Validators.required]],

      // Asignación de Cliente
      id_cliente: [user?.id_usuario || '', [Validators.required]],

      // Parte Demandante
      demandante_tipo: ['Persona Física'],
      demandante_nombre: ['', [Validators.required]],
      demandante_identificacion: [''],
      demandante_telefono: [''],
      demandante_correo: ['', [Validators.email]],
      demandante_direccion: [''],

      // Parte Demandada
      demandado_tipo: ['Persona Física'],
      demandado_nombre: ['', [Validators.required]],
      demandado_identificacion: [''],
      demandado_telefono: [''],
      demandado_correo: ['', [Validators.email]],
      demandado_direccion: [''],

      // Asignación del Equipo
      abogado_responsable: [user?.nombre || 'Dr. Carlos Mendoza'],
      paralegal_asignado: [''],

      // Descripción del Caso
      descripcion_hechos: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Auto-generar un número de expediente sugerido
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.expedienteForm.patchValue({
      numero_expediente: `EXP-2026-${randomNum}`
    });
  }

  onSubmit(): void {
    if (this.expedienteForm.invalid) {
      this.expedienteForm.markAllAsTouched();
      this.mensajeError = 'Por favor complete todos los campos obligatorios marcados con (*).';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const formValues = this.expedienteForm.value;

    const payload: Expediente = {
      id_expediente: '',
      numero_expediente: formValues.numero_expediente,
      id_cliente: formValues.id_cliente,
      materia: formValues.materia,
      estado: formValues.estado,
      tribunal_juzgado: formValues.tribunal_juzgado,
      juez_cargo: formValues.juez_cargo || undefined,
      cuantia_litigio: formValues.cuantia_litigio ? Number(formValues.cuantia_litigio) : undefined,
      fecha_apertura: formValues.fecha_apertura,
      descripcion_hechos: formValues.descripcion_hechos
    };

    this.expedienteService.crearExpediente(payload).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensajeExito = '¡Expediente registrado exitosamente!';
        setTimeout(() => {
          this.router.navigate(['/expedientes/lista']);
        }, 1500);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al crear expediente:', err);
        this.mensajeError = err.error?.error || 'Ocurrió un error al intentar crear el expediente.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/expedientes/lista']);
  }
}
