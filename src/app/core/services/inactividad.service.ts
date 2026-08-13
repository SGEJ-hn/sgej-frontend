import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ConfiguracionService } from './configuracion.service';

@Injectable({
  providedIn: 'root',
})
export class InactividadService implements OnDestroy {
  private tiempoInactividadMs = 30 * 60 * 1000; // 30 minutos por defecto
  private tiempoAlertaMs = 60 * 1000; // Alerta 1 minuto antes
  private timerInactividad: any = null;
  private timerAlerta: any = null;
  private activo = false;

  private readonly eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

  constructor(
    private authService: AuthService,
    private configService: ConfiguracionService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  /**
   * Inicia el monitoreo de inactividad.
   * Carga el tiempo de inactividad desde la configuración del sistema.
   */
  iniciar(): void {
    if (this.activo) return;
    this.activo = true;

    // Cargar configuración del sistema para obtener el tiempo de inactividad
    this.configService.obtenerConfiguracion().subscribe({
      next: (config) => {
        if (config && config.tiempo_inactividad_min > 0) {
          this.tiempoInactividadMs = config.tiempo_inactividad_min * 60 * 1000;
        }
        this.registrarEventos();
        this.reiniciarTimer();
      },
      error: () => {
        // Si falla la carga, usar valores por defecto (30 min)
        this.registrarEventos();
        this.reiniciarTimer();
      },
    });
  }

  /**
   * Detiene completamente el monitoreo de inactividad.
   */
  detener(): void {
    this.activo = false;
    this.limpiarTimers();
    this.desregistrarEventos();
  }

  ngOnDestroy(): void {
    this.detener();
  }

  private registrarEventos(): void {
    this.eventos.forEach((evento) => {
      document.addEventListener(evento, this.onActividad, { passive: true });
    });
  }

  private desregistrarEventos(): void {
    this.eventos.forEach((evento) => {
      document.removeEventListener(evento, this.onActividad);
    });
  }

  private onActividad = (): void => {
    if (!this.activo) return;
    this.reiniciarTimer();
  };

  private reiniciarTimer(): void {
    this.limpiarTimers();

    // Timer para la alerta previa (1 minuto antes de cerrar sesión)
    const tiempoHastaAlerta = this.tiempoInactividadMs - this.tiempoAlertaMs;

    if (tiempoHastaAlerta > 0) {
      this.timerAlerta = setTimeout(() => {
        this.ngZone.run(() => {
          this.mostrarAlerta();
        });
      }, tiempoHastaAlerta);
    }

    // Timer principal para cerrar sesión
    this.timerInactividad = setTimeout(() => {
      this.ngZone.run(() => {
        this.cerrarSesionPorInactividad();
      });
    }, this.tiempoInactividadMs);
  }

  private limpiarTimers(): void {
    if (this.timerInactividad) {
      clearTimeout(this.timerInactividad);
      this.timerInactividad = null;
    }
    if (this.timerAlerta) {
      clearTimeout(this.timerAlerta);
      this.timerAlerta = null;
    }
  }

  private mostrarAlerta(): void {
    const continuar = confirm(
      '⚠️ Su sesión está a punto de expirar por inactividad.\n\n' +
      'Se cerrará automáticamente en 1 minuto.\n\n' +
      '¿Desea continuar su sesión?'
    );

    if (continuar) {
      this.reiniciarTimer();
    }
  }

  private cerrarSesionPorInactividad(): void {
    this.detener();
    this.authService.logout();
    this.router.navigate(['/login']);
    // Breve delay para que el usuario vea el mensaje
    setTimeout(() => {
      alert('Su sesión ha sido cerrada por inactividad. Por favor, inicie sesión nuevamente.');
    }, 100);
  }
}
