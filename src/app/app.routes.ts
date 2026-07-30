import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { Calendario } from './features/Calendario/components/calendario/calendario'; 


@Component({
  selector: 'app-dashboard-dummy',
  standalone: true,
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-[#4B1623] mb-4">
        Dashboard Principal
      </h1>
      <p class="text-[#64748B]">
        Bienvenido al Sistema de Gestión de Expedientes Jurídicos (SGEJ).
      </p>
    </div>
  `
})
export class DashboardDummyComponent {
  titulo = '';
}


@Component({
  selector: 'app-page-dummy',
  standalone: true,
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-[#4B1623]">
        {{titulo}}
      </h1>
    </div>
  `
})
export class PageDummyComponent {
  titulo = '';
}


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardDummyComponent,
    canActivate: [authGuard],
  },
  {
    path: 'expedientes',
    component: PageDummyComponent,
    canActivate: [authGuard],
  },
  {
    path: 'documentos',
    component: PageDummyComponent,
    canActivate: [authGuard],
  },
  {
    path: 'calendario',
    component: Calendario,
    canActivate: [authGuard],
  },
  {
    path: 'usuarios',
    component: PageDummyComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reportes',
    component: PageDummyComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  }
];