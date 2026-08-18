import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { DashboardAdmin } from './components/dashboard-admin/dashboard-admin';
import { DashboardAbogado } from './components/dashboard-abogado/dashboard-abogado';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardAdmin, DashboardAbogado],
  template: `
    <!-- Vista del Administrador -->
    <ng-container *ngIf="rolUsuario === 'Administrador'">
      <app-dashboard-admin></app-dashboard-admin>
    </ng-container>

    <!-- Vista del Abogado / Paralegal -->
    <ng-container *ngIf="rolUsuario === 'Abogado' || rolUsuario === 'Paralegal'">
      <app-dashboard-abogado></app-dashboard-abogado>
    </ng-container>
  `
})
export class DashboardComponent implements OnInit {
  rolUsuario: string = '';
  private authService = inject(AuthService);

  ngOnInit(): void {
    const usuario = this.authService.getUser();
    if (usuario && usuario.rol) {
      this.rolUsuario = usuario.rol;
    }
  }
}