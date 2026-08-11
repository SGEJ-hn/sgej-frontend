import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HistorialService, EventoHistorial } from '../../../../core/services/historial.service';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.html',
  styleUrls: ['./historial.css'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    SharedHeader,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroArrowLeft })],
})
export class HistorialComponent implements OnInit {
  idExpediente: string = '';
  numeroExpediente: string = '';
  historial: EventoHistorial[] = [];
  categoriaActiva: string = 'Todos';
  totalEntradas: number = 0;
  cargando: boolean = false;

  // 👇 Nuevas variables para Paginación
  paginaActual: number = 1;
  limite: number = 10;
  totalPaginas: number = 1;

  pestanas: string[] = ['Todos', 'Citas', 'Documentos', 'Expediente'];
  
  constructor(
    private route: ActivatedRoute,
    private historialService: HistorialService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Escuchamos los parámetros de la URL activamente
    this.route.paramMap.subscribe(() => {
      this.idExpediente = this.extraerIdDelArbolDeRutas();

      console.log('ID del Expediente capturado:', this.idExpediente);

      if (this.idExpediente) {
        this.cargarHistorial();
      } else {
        console.error('ALERTA: No se pudo extraer el ID de la URL al recargar/navegar.');
      }
    });
  }

  /**
   * Recorre el árbol de rutas desde la actual hacia la raíz 
   * para obtener el parámetro 'id' o 'id_expediente' en cualquier nivel.
   */
  private extraerIdDelArbolDeRutas(): string {
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const id = currentRoute.snapshot.paramMap.get('id') || 
                 currentRoute.snapshot.paramMap.get('id_expediente');
      if (id) return id;
      currentRoute = currentRoute.parent;
    }
    return '';
  }

  cambiarPestana(categoria: string): void {
    if (!this.idExpediente) return; 

    this.categoriaActiva = categoria;
    this.paginaActual = 1; // 👈 Volver a la página 1 al cambiar de filtro
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    if (!this.idExpediente) return;

    this.cargando = true;
    this.cdr.detectChanges(); // Forzamos actualización visual inmediata de "Cargando..."

    // 👇 Enviamos paginaActual y limite al servicio
    this.historialService.obtenerHistorial(this.idExpediente, this.categoriaActiva, this.paginaActual, this.limite)
      .pipe(
        finalize(() => {
          // 'finalize' se ejecuta SIEMPRE al terminar la petición (éxito, error o cancelada)
          this.cargando = false;
          this.cdr.detectChanges(); // Forzamos a Angular a re-renderizar la vista
        })
      )
      .subscribe({
        next: (res) => {
          this.historial = res.historial || [];
          this.totalEntradas = res.total || 0;
          this.totalPaginas = res.total_paginas || 1; // 👈 Capturamos el total de páginas
          this.numeroExpediente = res.numero_expediente || this.idExpediente;
          console.log('Historial cargado con éxito:', res);
        },
        error: (err) => {
          console.error('Error al cargar historial desde el backend:', err);
          this.historial = [];
          this.totalEntradas = 0;
          this.totalPaginas = 1;
        }
      });
  }

  // 👇 NUEVOS MÉTODOS PARA NAVEGACIÓN

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarHistorial();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarHistorial();
    }
  }
}