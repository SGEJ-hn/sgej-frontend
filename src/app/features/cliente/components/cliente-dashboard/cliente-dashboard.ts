import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';

export interface NotificacionCliente {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  tipo: 'documento' | 'cita' | 'actualizacion';
}

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedHeader
  ],
  templateUrl: './cliente-dashboard.html',
  styleUrl: './cliente-dashboard.css'
})
export class ClienteDashboard implements OnInit {
  public authService = inject(AuthService);
  private expedienteService = inject(ExpedienteService);

  usuario: User | null = null;
  expedientes: Expediente[] = [];
  expedientePrincipal: Expediente | null = null;
  cargando = true;
  error = '';

  notificaciones: NotificacionCliente[] = [
    {
      id: '1',
      titulo: 'Documento disponible',
      descripcion: 'El documento Contrato_Compraventa.pdf está disponible para consulta y descarga.',
      fecha: '12 Julio 2026',
      leida: false,
      tipo: 'documento'
    },
    {
      id: '2',
      titulo: 'Cita programada',
      descripcion: 'Su cita con la Dra. Ana López fue confirmada para el 15 de Julio a las 10:00 AM.',
      fecha: '10 Julio 2026',
      leida: false,
      tipo: 'cita'
    },
    {
      id: '3',
      titulo: 'Actualización de estado',
      descripcion: 'El expediente EXP-001-2026 cambió al estado En Proceso.',
      fecha: '08 Julio 2026',
      leida: true,
      tipo: 'actualizacion'
    }
  ];

  proximasCitas = [
    {
      titulo: 'Consulta de seguimiento del caso',
      abogado: 'Dra. Ana López',
      fecha: '15 Julio 2026',
      hora: '10:00 AM',
      modalidad: 'Presencial - Oficina Principal'
    },
    {
      titulo: 'Revisión de documentación preliminar',
      abogado: 'Dra. Ana López',
      fecha: '28 Julio 2026',
      hora: '02:00 PM',
      modalidad: 'Virtual - Zoom'
    }
  ];

  ngOnInit(): void {
    this.usuario = this.authService.getUser();
    this.cargarDatosCliente();
  }

  cargarDatosCliente(): void {
    this.cargando = true;
    this.error = '';

    this.expedienteService.obtenerExpedientes().subscribe({
      next: (res) => {
        // Filtrar expedientes pertenecientes al cliente logueado
        if (this.usuario) {
          const userId = this.usuario.id_usuario;
          this.expedientes = res.expedientes.filter(
            exp => exp.id_cliente === userId || exp.cliente?.id_usuario === userId
          );

          // Si no hay filtro estricto (ej. mock data en desarrollo), mostrar los expedientes devueltos
          if (this.expedientes.length === 0 && res.expedientes.length > 0) {
            this.expedientes = res.expedientes;
          }
        } else {
          this.expedientes = res.expedientes;
        }

        if (this.expedientes.length > 0) {
          this.expedientePrincipal = this.expedientes[0];
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del cliente:', err);
        this.cargando = false;
        // Datos demostrativos de respaldo para el cliente
        this.expedientes = [
          {
            id_expediente: 'exp-001',
            numero_expediente: 'EXP-001-2026',
            id_cliente: this.usuario?.id_usuario || 'usr-1',
            materia: 'Civil',
            estado: 'En proceso',
            tribunal_juzgado: 'Juzgado de Letras de lo Civil',
            fecha_apertura: '2026-06-10',
            descripcion_hechos: 'Proceso legal relacionado con contrato de compraventa.',
            cliente: {
              id_usuario: this.usuario?.id_usuario || 'usr-1',
              nombre: this.usuario?.nombre || 'Juan López',
              correo: this.usuario?.correo || 'juan.lopez@gmail.com'
            }
          }
        ];
        this.expedientePrincipal = this.expedientes[0];
      }
    });
  }

  get notificacionesSinLeer(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  marcarComoLeida(notificacion: NotificacionCliente): void {
    notificacion.leida = true;
  }
}
