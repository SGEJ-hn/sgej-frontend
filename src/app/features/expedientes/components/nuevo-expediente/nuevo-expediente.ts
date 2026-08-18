import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroDocumentPlus } from '@ng-icons/heroicons/outline';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-nuevo-expediente',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedHeader,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroDocumentPlus })],
  templateUrl: './nuevo-expediente.html',
  styleUrl: './nuevo-expediente.css'
})
export class NuevoExpediente implements OnInit {
  private fb = inject(FormBuilder);
  private expedienteService = inject(ExpedienteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

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

  listaAbogados: any[] = [];
  listaParalegales: any[] = [];

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    const user = this.authService.getUser();

    this.expedienteForm = this.fb.group({
      // Clasificación del Expediente
      numero_expediente: ['', [Validators.required]],
      materia: ['Civil', [Validators.required]],
      estado: ['Abierto', [Validators.required]],
      tribunal_juzgado: ['Juzgado de Letras de lo Civil', [Validators.required]],
      juez_cargo: [''], 
      cuantia_litigio: [null],
      fecha_apertura: [today, [Validators.required]],

      id_cliente: [user?.id_usuario || '', [Validators.required]],

      // Parte Demandante (Sin teléfono)
      demandante_tipo: ['Persona Física'],
      demandante_nombre: ['', [Validators.required]],
      demandante_identificacion: [''],
      demandante_correo: ['', [Validators.email]],
      demandante_direccion: [''],

      // Parte Demandada (Sin teléfono)
      demandado_tipo: ['Persona Física'],
      demandado_nombre: ['', [Validators.required]],
      demandado_identificacion: [''],
      demandado_correo: ['', [Validators.email]],
      demandado_direccion: [''],

      // Asignación del Equipo
      abogado_responsable: [user?.id_usuario || '', [Validators.required]],
      paralegales_asignados: [[]],

      // Descripción del Caso
      descripcion_hechos: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Auto-generar un número de expediente sugerido
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.expedienteForm.patchValue({
      numero_expediente: `EXP2026-${randomNum}`
    });

    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.http.get<any[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (usuarios) => {
        this.listaAbogados = usuarios.filter(u => u.rol === 'Abogado' || u.rol === 'Administrador');
        this.listaParalegales = usuarios.filter(u => u.rol === 'Paralegal');
      },
      error: (err) => {
        console.error('Error al cargar la lista de usuarios:', err);
      }
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

    // 1. Armar equipo asignado (Abogado + N Paralegales)
    const equipoAsignado: { id_usuario: string; rol_en_caso: string }[] = [];
    
    if (formValues.abogado_responsable) {
      equipoAsignado.push({
        id_usuario: formValues.abogado_responsable,
        rol_en_caso: 'Abogado'
      });
    }

    if (formValues.paralegales_asignados && formValues.paralegales_asignados.length > 0) {
      formValues.paralegales_asignados.forEach((id: string) => {
        equipoAsignado.push({
          id_usuario: id,
          rol_en_caso: 'Paralegal'
        });
      });
    }

    // 2. Armar partes involucradas (Coincide exacto con la tabla ParteInvolucrada de la BD)
    const partesDelCaso = [
      {
        clasificacion: 'Demandante',
        tipo_persona: formValues.demandante_tipo,
        nombre_completo: formValues.demandante_nombre,
        identificacion: formValues.demandante_identificacion,
        correo_contacto: formValues.demandante_correo,
        direccion: formValues.demandante_direccion
      },
      {
        clasificacion: 'Demandada',
        tipo_persona: formValues.demandado_tipo,
        nombre_completo: formValues.demandado_nombre,
        identificacion: formValues.demandado_identificacion,
        correo_contacto: formValues.demandado_correo,
        direccion: formValues.demandado_direccion
      }
    ];

    // 3. Payload alineado con el Servicio y la BD
    const payload: Expediente = {
      numero_expediente: formValues.numero_expediente,
      id_cliente: formValues.id_cliente,
      materia: formValues.materia,
      estado: formValues.estado,
      tribunal_juzgado: formValues.tribunal_juzgado,
      juez_cargo: formValues.juez_cargo || undefined,
      cuantia_litigio: formValues.cuantia_litigio ? Number(formValues.cuantia_litigio) : undefined,
      fecha_apertura: formValues.fecha_apertura,
      descripcion_hechos: formValues.descripcion_hechos,
      equipo: equipoAsignado,
      partes_involucradas: partesDelCaso
    };

    this.expedienteService.crearExpediente(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = 'Expediente registrado exitosamente.';
        setTimeout(() => {
          this.router.navigate(['/expedientes']);
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
    this.router.navigate(['/expedientes']);
  }
}