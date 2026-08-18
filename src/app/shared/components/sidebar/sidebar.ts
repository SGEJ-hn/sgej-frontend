import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { filter, Subscription } from 'rxjs';

import {
  heroHome,
  heroFolder,
  heroDocument,
  heroCalendar,
  heroUsers,
  heroChartPie,
  heroArrowRightOnRectangle,
  heroCog8Tooth
} from '@ng-icons/heroicons/outline';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    RouterLink
  ],
  providers: [
    provideIcons({
      heroHome,
      heroFolder,
      heroDocument,
      heroCalendar,
      heroUsers,
      heroChartPie,
      heroArrowRightOnRectangle,
      heroCog8Tooth
    })
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {

  rutaActual: string = '';
  private routerSub!: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // 👈 1. Inyectamos la herramienta para forzar el redibujado
  ) {}

  ngOnInit() {
    // Capturamos la ruta inicial al cargar
    this.rutaActual = this.router.url;

    // 2. Escuchamos activamente cuando la navegación de Angular termina
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.rutaActual = event.urlAfterRedirects;
      
      // 👇 3. ¡LA MAGIA AQUÍ! Obligamos a Angular a actualizar los colores del Sidebar al instante 👇
      this.cdr.detectChanges(); 
    });
  }

  ngOnDestroy() {
    // Limpiamos la memoria si el componente se destruye
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  get usuario() {
    return this.authService.getUser();
  }

  menuItems = [
    {
      nombre: 'Inicio',
      ruta: '/dashboard',
      icono: 'heroHome',
      roles: ['Administrador', 'Abogado', 'Paralegal']
    },
    {
      nombre: 'Mi portal',
      ruta: '/cliente',
      icono: 'heroHome',
      roles: ['Cliente']
    },
    {
      nombre: 'Expedientes',
      ruta: '/expedientes',
      icono: 'heroFolder',
      roles: ['Administrador', 'Abogado', 'Paralegal', 'Cliente']
    },
    {
      nombre: 'Calendario',
      ruta: '/calendario',
      icono: 'heroCalendar',
      roles: ['Administrador', 'Abogado', 'Paralegal', 'Cliente'] 
    },
    {
      nombre: 'Gestion de Usuarios',
      ruta: '/usuarios',
      icono: 'heroUsers',
      roles: ['Administrador'] 
    },
    {
      nombre: 'Reportes Generales',
      ruta: '/reportes',
      icono: 'heroChartPie',
      roles: ['Administrador', 'Abogado'] 
    },
    {
      nombre: 'Configuración',
      ruta: '/configuracion',
      icono: 'heroCog8Tooth',
      roles: ['Administrador'] 
    }
  ];

  get menuFiltrado() {
    const usuarioActual = this.usuario;
    if (!usuarioActual || !usuarioActual.rol) {
      return [];
    }
    return this.menuItems.filter(item => item.roles.includes(usuarioActual.rol));
  }

  get iniciales(): string {
    const nombre = this.usuario?.nombre || 'AD';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // 👇 Esta función decide qué se ilumina leyendo la variable que acabamos de actualizar 👇
  esActivo(item: any): boolean {
    if (item.nombre === 'Inicio') {
      return this.rutaActual === '/dashboard';
    }
    if (item.nombre === 'Documentos') {
      return this.rutaActual.includes('/documentos');
    }
    if (item.nombre === 'Expedientes') {
      // Se apaga automáticamente si la ruta incluye /documentos
      return this.rutaActual.includes('/expedientes') && !this.rutaActual.includes('/documentos');
    }
    
    return this.rutaActual.startsWith(item.ruta);
  }
}
