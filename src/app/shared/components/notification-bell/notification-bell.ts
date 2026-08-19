import { Component, OnInit, inject, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBell, heroCalendar, heroDocumentText, heroInformationCircle } from '@ng-icons/heroicons/outline';
import { NotificationService, Notificacion } from '../../../core/services/notification';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroBell, heroCalendar, heroDocumentText, heroInformationCircle })],
  templateUrl: './notification-bell.html'
})
export class NotificationBellComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private eRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef); // Forzará la actualización visual instantánea

  isOpen = false;
  notificaciones: Notificacion[] = [];
  unreadCount = 0;

  // Modal
  isModalOpen = false;
  notificacionSeleccionada: Notificacion | null = null;

  ngOnInit(): void {
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.detectChanges();
    });
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.notificationService.getMisNotificaciones().subscribe({
      next: (res) => {
        this.notificaciones = res.notificaciones;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  // Cierra el menú desplegable al hacer clic afuera
  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    // Si el modal está abierto, ignoramos el clic para evitar conflictos
    if (this.isModalOpen) return;

    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  manejarClicNotificacion(notificacion: Notificacion): void {
    // 1. Marcar como leída
    if (!notificacion.leida) {
      this.notificationService.marcarComoLeida(notificacion.id_notificacion).subscribe(() => {
        notificacion.leida = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges(); 
      });
    }

    // 2. Abrir Modal
    this.notificacionSeleccionada = notificacion;
    this.isModalOpen = true;
    this.isOpen = false; // Cierra la lista desplegable
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.notificacionSeleccionada = null;
  }

  marcarTodasComoLeidas(event: Event): void {
    event.preventDefault();
    event.stopPropagation(); // Evita que se cierre el menú de golpe

    this.notificationService.marcarTodasComoLeidas().subscribe({
      next: () => {
        // Marcamos todo como leído localmente y actualizamos pantalla
        this.notificaciones = this.notificaciones.map(n => ({ ...n, leida: true }));
        this.unreadCount = 0;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al marcar todas como leídas', err)
    });
  }

  getIconoPorTipo(tipo: string): string {
    if (!tipo) return 'heroInformationCircle';
    switch (tipo.toLowerCase()) {
      case 'cita': return 'heroCalendar';
      case 'documento': return 'heroDocumentText';
      case 'expediente': return 'heroDocumentText';
      default: return 'heroInformationCircle';
    }
  }
}