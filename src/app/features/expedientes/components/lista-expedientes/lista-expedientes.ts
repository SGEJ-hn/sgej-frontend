import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroTrash } from '@ng-icons/heroicons/outline';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';

@Component({
  selector: 'app-lista-expedientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedHeader,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroMagnifyingGlass, heroTrash })],
  templateUrl: './lista-expedientes.html',
  styleUrl: './lista-expedientes.css'
})
export class ListaExpedientes implements OnInit {

  private expedienteService = inject(ExpedienteService);
  private cdr = inject(ChangeDetectorRef);

  expedientes: Expediente[] = [];
  terminoBusqueda = '';
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarExpedientes();
  }

  cargarExpedientes(): void {
    this.cargando = true;
    this.error = '';

    this.expedienteService.obtenerExpedientes().subscribe({
      next: (respuesta) => {
        this.expedientes = respuesta.expedientes;
        this.cargando = false;

        console.log('Expedientes recibidos:', respuesta);
        
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar expedientes:', err);

        this.expedientes = [];
        this.cargando = false;

        if (err.status === 403) {
          this.error = 'No tiene permisos para consultar los expedientes.';
        } else if (err.status === 401) {
          this.error = 'Su sesión ha expirado. Inicie sesión nuevamente.';
        } else {
          this.error = 'No se pudieron cargar los expedientes.';
        }

        this.cdr.detectChanges();
      }
    });
  }
  obtenerNombreMostrar(expediente: any): string {
    // Buscar en partes_involucradas (o partes como fallback)
    const partes = expediente.partes_involucradas || expediente.partes;

    if (partes && partes.length > 0) {
      const demandante = partes.find(
        (p: any) => p.clasificacion?.toLowerCase() === 'demandante'
      );
      if (demandante && demandante.nombre_completo) {
        return demandante.nombre_completo;
      }
    }
    return expediente.cliente?.nombre || 'Sin registro';
  }

  // 2. Función mejorada para obtener el abogado
  obtenerAbogadoResponsable(expediente: Expediente): string {
    if (!expediente.equipo || expediente.equipo.length === 0) {
      return 'Sin asignar';
    }

    const abogado = expediente.equipo.find(
      integrante => integrante.rol_en_caso?.toLowerCase() === 'abogado'
    );

    // Cubrimos las opciones de que el backend devuelva 'user' o 'usuario'
    return abogado?.user?.nombre || abogado?.usuario?.nombre || 'Sin asignar';
  }

  get expedientesFiltrados(): Expediente[] {
    if (!this.terminoBusqueda.trim()) {
      return this.expedientes;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();

    return this.expedientes.filter(expediente =>
      expediente.numero_expediente.toLowerCase().includes(termino) ||
      expediente.materia.toLowerCase().includes(termino) ||
      expediente.estado.toLowerCase().includes(termino) ||
      expediente.tribunal_juzgado.toLowerCase().includes(termino)
    );
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
  }

  // NUEVO MÉTODO: Eliminar expediente con confirmación
  eliminarExpediente(id: string | undefined): void {
    if (!id) return;

    // Pedimos confirmación al usuario
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este expediente? Esta acción no se puede deshacer.');
    
    if (confirmacion) {
      this.expedienteService.eliminarExpediente(id).subscribe({
        next: () => {
          // Filtramos el arreglo para quitar el expediente eliminado sin recargar la página
          this.expedientes = this.expedientes.filter(e => e.id_expediente !== id);
          
          // Actualizamos la vista
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar el expediente:', err);
          alert('Ocurrió un error al intentar eliminar el expediente.');
        }
      });
    }
  }
}