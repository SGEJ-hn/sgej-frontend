import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-dummy',
  standalone: true,
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-[#4B1623] mb-4">Dashboard Principal</h1>
      <p class="text-[#64748B]">Bienvenido al Sistema de Gestión de Expedientes Jurídicos (SGEJ).</p>
    </div>
  `
})
export class DashboardDummyComponent {}

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardDummyComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

