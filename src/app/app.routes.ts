import { Routes } from '@angular/router';
import { Component } from '@angular/core';

import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardAdmin } from './features/dashboard/components/dashboard-admin/dashboard-admin';
import { Calendario } from './features/Calendario/components/calendario/calendario';
import { ExpedientesComponent } from './features/expedientes/pages/expedientes.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { ReportesComponent } from './features/reportes/reportes.component';

import { ListaExpedientes } from './features/expedientes/components/lista-expedientes/lista-expedientes';
import { DetalleExpediente } from './features/expedientes/components/detalle-expediente/detalle-expediente';
import { ListaDocumentos } from './features/expedientes/components/lista-documentos/lista-documentos';
import { DocumentosExpediente } from './features/expedientes/components/documentos-expediente/documentos-expediente';
import { ConfiguracionComponent } from './features/configuracion/configuracion.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { CrearUsuarioComponent } from './features/usuarios/crear-usuario/crear-usuario.component';

import { HistorialComponent } from './features/expedientes/components/historial/historial';
import { NuevoExpediente } from './features/expedientes/components/nuevo-expediente/nuevo-expediente';
import { ClienteDashboard } from './features/cliente/components/cliente-dashboard/cliente-dashboard';

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
        {{ titulo }}
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
    component: DashboardAdmin,
    canActivate: [authGuard],
  },

  // Lista general de expedientes
  {
    path: 'expedientes',
    component: ExpedientesComponent,
    canActivate: [authGuard],
  },

  // Lista de expedientes de tu módulo
  {
    path: 'expedientes/lista',
    component: ListaExpedientes,
    canActivate: [authGuard],
  },

  // Crear nuevo expediente
  {
    path: 'expedientes/nuevo',
    component: NuevoExpediente,
    canActivate: [authGuard],
  },

  // Portal de solo lectura para Cliente
  {
    path: 'cliente',
    component: ClienteDashboard,
    canActivate: [authGuard],
  },

  // Historial de expediente
  {
    path: 'expedientes/:id_expediente/historial',
    component: HistorialComponent,
    canActivate: [authGuard],
  },

  // Detalle de expediente
  {
    path: 'expedientes/:id_expediente',
    component: DetalleExpediente,
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
  // === GESTIÓN DE USUARIOS ===

  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [authGuard],
  },

  {
    path: 'usuarios/crear',
    component: CrearUsuarioComponent,
    canActivate: [authGuard],
  },
  // ============================
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [authGuard],
  },
  // === CONFIGURACIÓN DEL SISTEMA ===
  {
    path: 'configuracion',
    component: ConfiguracionComponent,
    canActivate: [authGuard],
  },
  // ============================

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