import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroTrash, heroEye} from '@ng-icons/heroicons/outline';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { AuthService } from '../../../../core/services/auth.service';

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
  viewProviders: [provideIcons({ heroMagnifyingGlass, heroTrash, heroEye })],
  templateUrl: './lista-expedientes.html',
  styleUrl: './lista-expedientes.css'
})
export class ListaExpedientes implements OnInit {

  private expedienteService = inject(ExpedienteService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  expedientes: Expediente[] = [];
  cargando = true;
  error = '';

  // Variables de Búsqueda y Paginación
  terminoBusqueda = '';
  private searchSubject = new Subject<string>();
  
  paginaActual: number = 1;
  limite: number = 8;
  totalPaginas: number = 1;
  totalEntradas: number = 0;

  get esAdministrador(): boolean {
    return this.authService.getUser()?.rol === 'Administrador';
  }

  ngOnInit(): void {
    this.cargarExpedientes();

    // Configuración del buscador con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(termino => {
      this.terminoBusqueda = termino;
      this.paginaActual = 1; // Resetea a la primera página al buscar
      this.cargarExpedientes();
    });
  }

  onSearchChange(termino: string) {
    this.searchSubject.next(termino);
  }

  cargarExpedientes(): void {
    this.cargando = true;
    this.error = '';

    this.expedienteService.obtenerExpedientes(this.paginaActual, this.limite, this.terminoBusqueda).subscribe({
      next: (respuesta: any) => {
        this.expedientes = respuesta.expedientes || [];
        
        // Actualizamos datos de paginación
        this.totalEntradas = respuesta.total || 0;
        this.totalPaginas = respuesta.total_paginas || Math.ceil(this.totalEntradas / this.limite) || 1;
        
        this.cargando = false;
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

  obtenerAbogadoResponsable(expediente: Expediente): string {
    if (!expediente.equipo || expediente.equipo.length === 0) {
      return 'Sin asignar';
    }
    const abogado = expediente.equipo.find(
      integrante => integrante.rol_en_caso?.toLowerCase() === 'abogado'
    );
    return abogado?.user?.nombre || abogado?.usuario?.nombre || 'Sin asignar';
  }

  eliminarExpediente(id: string | undefined): void {
    if (!id) return;
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este expediente? Esta acción no se puede deshacer.');
    if (confirmacion) {
      this.expedienteService.eliminarExpediente(id).subscribe({
        next: () => {
          this.cargarExpedientes(); // Recargamos para refrescar paginación desde backend
        },
        error: (err) => {
          console.error('Error al eliminar el expediente:', err);
          alert('Ocurrió un error al intentar eliminar el expediente.');
        }
      });
    }
  }

  // Funciones de paginación
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarExpedientes();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarExpedientes();
    }
  }
}