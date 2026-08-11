import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { Calendario } from './features/Calendario/components/calendario/calendario'; 
import { ExpedientesComponent } from './features/expedientes/pages/expedientes.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { ListaDocumentos } from './features/expedientes/components/lista-documentos/lista-documentos';
import { DocumentosExpediente } from './features/expedientes/components/documentos-expediente/documentos-expediente';
import { HistorialComponent } from './features/expedientes/components/historial/historial';


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
  // === FLUJO DE EXPEDIENTES ===
  {
    path: 'expedientes',
    component: ExpedientesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'expedientes/:id_expediente/historial',
    component: HistorialComponent,
    canActivate: [authGuard],
  },
  {
    path: 'expedientes/:id_expediente/documentos',
    component: ListaDocumentos,
    canActivate: [authGuard],
  },
  {
    path: 'expedientes/:id_expediente/documentos/subir',
    component: DocumentosExpediente,
    canActivate: [authGuard],
  },
  // ============================
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
    component: UsuariosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reportes',
    component: ReportesComponent,
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