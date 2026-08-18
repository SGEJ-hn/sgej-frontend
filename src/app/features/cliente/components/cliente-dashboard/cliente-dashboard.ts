import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroLockClosedSolid, heroFolderSolid, heroCalendarSolid, heroBellSolid, heroScaleSolid, heroEyeSolid, heroMapPinSolid, heroChatBubbleLeftEllipsisSolid, heroEnvelopeSolid, heroUserSolid } from '@ng-icons/heroicons/solid';

import { AuthService, User } from '../../../../core/services/auth.service';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { Cita, CitaService } from '../../../../core/services/cita.service';
import { NotificationService } from '../../../../core/services/notification';
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
    SharedHeader,
    NgIconComponent
  ],
  viewProviders: [provideIcons({
    heroLockClosedSolid, heroFolderSolid, heroCalendarSolid, heroBellSolid, heroScaleSolid, heroEyeSolid, heroMapPinSolid, heroChatBubbleLeftEllipsisSolid, heroEnvelopeSolid, heroUserSolid
  })],
  templateUrl: './cliente-dashboard.html',
  styleUrl: './cliente-dashboard.css'
})
export class ClienteDashboard implements OnInit {
  public authService = inject(AuthService);
  private expedienteService = inject(ExpedienteService);
  private citaService = inject(CitaService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  usuario: User | null = null;
  expedientes: Expediente[] = [];
  expedientePrincipal: Expediente | null = null;
  cargando = true;
  error = '';

  notificaciones: NotificacionCliente[] = [];
  proximasCitas: Array<{ titulo: string; abogado: string; fecha: string; hora: string; modalidad: string }> = [];

  ngOnInit(): void {
    this.usuario = this.authService.getUser();
    this.cargarDatosCliente();
  }

  cargarDatosCliente(): void {
    this.cargando = true;
    this.error = '';

    this.expedienteService.obtenerExpedientes().subscribe({
      next: (res) => {
        this.expedientes = res.expedientes;

       if (this.expedientes.length > 0) {
          this.expedientePrincipal = this.expedientes[0];
        }

        this.cargando = false;
        this.cargarCitas();
        this.cargarNotificaciones();        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar datos del cliente:', err);
        this.cargando = false;
        this.error = 'No se pudo cargar la información de sus expedientes.';
        this.cdr.detectChanges();
      }
    });
  }

  private cargarCitas(): void {
    this.citaService.obtenerCitas().subscribe({
      next: (citas: any[]) => { 
        
        const idsMisExpedientes = this.expedientes.map(e => e.id_expediente);
        const citasDelCliente = citas.filter(c => idsMisExpedientes.includes(c.id_expediente));

        this.proximasCitas = citasDelCliente.slice(0, 5).map(cita => {
          let horaLimpia = 'Sin hora';
          if (cita.hora_inicio) {
            if (cita.hora_inicio.includes('T')) {
              horaLimpia = cita.hora_inicio.split('T')[1].substring(0, 5);
            } else {
              horaLimpia = cita.hora_inicio.substring(0, 5);
            }
          }

          return {
            titulo: cita.titulo,
            abogado: 'Equipo legal asignado',
            fecha: new Date(cita.fecha).toLocaleDateString('es-HN'),
            hora: horaLimpia,
            modalidad: cita.lugar_sala || 'Pendiente de confirmar',
          };
        });

        this.cdr.detectChanges(); 
      },
      error: () => { 
        this.proximasCitas = []; 
        this.cdr.detectChanges();
      },
    });
  }

  private cargarNotificaciones(): void {
    this.notificationService.getMisNotificaciones().subscribe({
      next: respuesta => {
        this.notificaciones = respuesta.notificaciones.map(n => ({
          id: n.id_notificacion,
          titulo: n.titulo,
          descripcion: n.mensaje,
          fecha: new Date(n.fecha_creacion).toLocaleDateString('es-HN'),
          leida: n.leida,
          tipo: n.tipo === 'cita' ? 'cita' : n.tipo === 'documento' ? 'documento' : 'actualizacion',
        }));
        this.cdr.detectChanges(); 
      },
      error: () => { 
        this.notificaciones = []; 
        this.cdr.detectChanges();
      },
    });
  }

  get notificacionesSinLeer(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  marcarComoLeida(notificacion: NotificacionCliente): void {
    if (notificacion.leida) return;
    this.notificationService.marcarComoLeida(notificacion.id).subscribe({
      next: () => { 
        notificacion.leida = true; 
        this.cdr.detectChanges();
      },
    });
  }

  get abogadoPrincipal() {
    if (!this.expedientePrincipal?.equipo || this.expedientePrincipal.equipo.length === 0) return null;
    return this.expedientePrincipal.equipo[0].usuario || this.expedientePrincipal.equipo[0].user || null;
  }

  getAbogadoNombre(exp: Expediente): string {
    if (!exp.equipo || exp.equipo.length === 0) return 'Sin asignar';
    const u = exp.equipo[0].usuario || exp.equipo[0].user;
    return u?.nombre ? 'Dr(a). ' + u.nombre : 'Sin asignar';
  }
}