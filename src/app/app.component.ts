import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { fadeAnimation } from './shared/animations/route-animations';
import { InactividadService } from './core/services/inactividad.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [fadeAnimation]
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private inactividadService: InactividadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Si el usuario ya está autenticado, activar monitoreo de inactividad
    if (this.authService.isAuthenticated()) {
      this.inactividadService.iniciar();
    }
  }

  ngOnDestroy(): void {
    this.inactividadService.detener();
  }

  // Verifica si estamos en el login
  isLoginRoute(): boolean {
    return this.router.url === '/' ||
           this.router.url.startsWith('/login') ||
           this.router.url.startsWith('/olvide-password') || 
           this.router.url.startsWith('/restablecer-password');
  }

  prepararRuta(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute : '';
  }

}