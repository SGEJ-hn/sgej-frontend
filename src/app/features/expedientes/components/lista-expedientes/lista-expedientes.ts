import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';

@Component({
  selector: 'app-lista-expedientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedHeader
  ],
  templateUrl: './lista-expedientes.html',
  styleUrl: './lista-expedientes.css'
})
export class ListaExpedientes implements OnInit {

  private expedienteService = inject(ExpedienteService);

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
      }
    });
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
}
