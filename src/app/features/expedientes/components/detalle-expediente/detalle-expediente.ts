import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';

@Component({
  selector: 'app-detalle-expediente',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './detalle-expediente.html',
  styleUrl: './detalle-expediente.css'
})
export class DetalleExpediente implements OnInit {

  private route = inject(ActivatedRoute);
  private expedienteService = inject(ExpedienteService);

  expediente: Expediente | null = null;
  cargando = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id_expediente');

    if (!id) {
      this.error = 'No se encontró el identificador del expediente.';
      this.cargando = false;
      return;
    }

    this.cargarExpediente(id);
  }

  cargarExpediente(id: string): void {
    this.expedienteService.obtenerExpediente(id).subscribe({
      next: (respuesta) => {
        this.expediente = respuesta;
        this.cargando = false;

        console.log('Expediente recibido:', respuesta);
      },

      error: (err) => {
        console.error('Error al obtener expediente:', err);

        this.cargando = false;

        if (err.status === 404) {
          this.error = 'El expediente no fue encontrado.';
        } else if (err.status === 401) {
          this.error = 'Su sesión ha expirado. Inicie sesión nuevamente.';
        } else if (err.status === 403) {
          this.error = 'No tiene permisos para consultar este expediente.';
        } else {
          this.error = 'No se pudo cargar el expediente.';
        }
      }
    });
  }
}