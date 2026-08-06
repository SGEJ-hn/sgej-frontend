import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBell, heroCalendar, heroDocumentText, heroInformationCircle } from '@ng-icons/heroicons/outline';
import { NotificationService, Notificacion } from '../../../core/services/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroBell, heroCalendar, heroDocumentText, heroInformationCircle })],
  templateUrl: './notification-bell.html'
})
export class NotificationBellComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private eRef = inject(ElementRef);

  // Variables de estado
  isOpen = false;
  notificaciones: Notificacion[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    // 1. Suscribirse al contador reactivo del servicio
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    // 2. Cargar las notificaciones iniciales
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.notificationService.getMisNotificaciones().subscribe({
      next: (res) => {
        this.notificaciones = res.notificaciones;
      },
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  // Cierra el menú si se hace clic afuera
  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  manejarClicNotificacion(notificacion: Notificacion): void {
    // Si no está leída, avisamos al backend
    if (!notificacion.leida) {
      this.notificationService.marcarComoLeida(notificacion.id_notificacion).subscribe(() => {
        notificacion.leida = true; // Actualizamos la vista local
      });
    }

    // Redirigimos al enlace asociado (si existe)
    if (notificacion.enlace_referencia) {
      this.isOpen = false; // Cerramos el menú
      this.router.navigateByUrl(notificacion.enlace_referencia);
    }
  }

  // Helper para elegir un icono según el tipo
  getIconoPorTipo(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'cita': return 'heroCalendar';
      case 'documento': return 'heroDocumentText';
      default: return 'heroInformationCircle';
    }
  }
}