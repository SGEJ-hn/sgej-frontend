import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

import {
  heroHome,
  heroFolder,
  heroDocument,
  heroCalendar,
  heroUsers,
  heroChartPie,
  heroArrowRightOnRectangle
} from '@ng-icons/heroicons/outline';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    CommonModule,
    NgIconComponent,
    RouterLink,
    RouterLinkActive
  ],

  providers: [
    provideIcons({
      heroHome,
      heroFolder,
      heroDocument,
      heroCalendar,
      heroUsers,
      heroChartPie,
      heroArrowRightOnRectangle
    })
  ],

  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}


  get usuario() {
    return this.authService.getUser();
  }


  menuItems = [
    {
      nombre: 'Inicio',
      ruta: '/dashboard',
      icono: 'heroHome',
      roles: ['Administrador', 'Abogado', 'Paralegal', 'Cliente'] 
    },
    {
      nombre: 'Expedientes',
      ruta: '/expedientes',
      icono: 'heroFolder',
      roles: ['Administrador', 'Abogado', 'Paralegal', 'Cliente']
    },
    {
      nombre: 'Documentos',
      ruta: '/documentos',
      icono: 'heroDocument',
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

}