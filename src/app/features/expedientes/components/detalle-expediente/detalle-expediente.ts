import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; // 1. IMPORTAR FORMSMODULE
import { ExpedienteService, Expediente, ParteInvolucrada } from '../../../../core/services/expediente'; 
import { HistorialService, EventoHistorial } from '../../../../core/services/historial.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { 
  heroArrowLeft, 
  heroDocumentText,
  heroInformationCircle,
  heroUsers,
  heroUser,
  heroBriefcase,
  heroPencilSquare,
  heroClock
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-detalle-expediente',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, // 2. AGREGAR A IMPORTS
    NgIconComponent, 
    SharedHeader
  ], 
  viewProviders: [provideIcons({ 
    heroArrowLeft,heroDocumentText,heroInformationCircle,heroUsers,heroBriefcase,heroUser,heroPencilSquare,heroClock
  })],
  templateUrl: './detalle-expediente.html',
  styleUrls: ['./detalle-expediente.css']
})
export class DetalleExpediente implements OnInit {
  expediente: Expediente | null = null;
  cargando: boolean = true;
  error: string | null = null;
  actividadesRecientes: EventoHistorial[] = [];

  // --- VARIABLES PARA EL MODAL DE EDICIÓN ---
  mostrarModalEdicion: boolean = false;
  expedienteEdicion: Partial<Expediente> = {};
  guardandoEdicion: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private expedienteService: ExpedienteService,
    private historialService: HistorialService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  get esAdministrador(): boolean {
    return this.authService.getUser()?.rol === 'Administrador';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id_expediente') || params.get('id');
        if (id) {
          this.cargarDetalle(id);
        } else {
          this.error = 'No se encontró un ID de expediente válido.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  cargarDetalle(id: string): void {
    this.cargando = true;
    this.error = null;

    this.expedienteService.obtenerExpediente(id).subscribe({
      next: (data: Expediente) => {
        this.expediente = data;
        this.cargarActividadReciente(id);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al obtener detalle:', err);
        this.error = 'Ocurrió un error al cargar la información del expediente.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarActividadReciente(idExpediente: string): void {
    this.historialService.obtenerHistorial(idExpediente, 'Todos', 1, 3).subscribe({
      next: (data) => {
        this.actividadesRecientes = data.historial || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al obtener historial reciente:', err);
        this.actividadesRecientes = []; 
      }
    });
  }

  // --- MÉTODOS PARA EL MODAL DE EDICIÓN ---

  abrirModalEditar(): void {
    if (!this.expediente) return;
    // Hacemos una copia superficial para editar sin alterar la vista hasta guardar
    this.expedienteEdicion = { ...this.expediente };
    this.mostrarModalEdicion = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEdicion = false;
    this.expedienteEdicion = {};
  }

  guardarEdicion(): void {
    if (!this.expediente?.id_expediente) return;

    this.guardandoEdicion = true;

    this.expedienteService.actualizarExpediente(this.expediente.id_expediente, this.expedienteEdicion).subscribe({
      next: (expedienteActualizado: Expediente) => {
        // Unimos la respuesta actualizada con las relaciones (cliente, equipo, partes) que ya teníamos
        this.expediente = {
          ...this.expediente,
          ...expedienteActualizado
        };

        this.guardandoEdicion = false;
        this.cerrarModalEditar();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al actualizar el expediente:', err);
        alert('Ocurrió un error al intentar guardar los cambios.');
        this.guardandoEdicion = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerPartes(): ParteInvolucrada[] {
    if (!this.expediente) return [];
    return this.expediente.partes_involucradas || this.expediente.partes || [];
  }

  obtenerNombreDemandante(): string {
    if (!this.expediente) return 'Cargando...';
    const partes = this.obtenerPartes();
    const demandante = partes.find(p => p.clasificacion?.toLowerCase() === 'demandante');
    return demandante ? demandante.nombre_completo : (this.expediente.cliente?.nombre || 'Cliente no especificado');
  }
}
