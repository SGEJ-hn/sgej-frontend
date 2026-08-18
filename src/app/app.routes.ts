import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { DashboardAdmin } from './features/dashboard/components/dashboard-admin/dashboard-admin';
import { ClienteDashboard } from './features/cliente/components/cliente-dashboard/cliente-dashboard';
import { Calendario } from './features/Calendario/components/calendario/calendario';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { CrearUsuarioComponent } from './features/usuarios/crear-usuario/crear-usuario.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { ListaExpedientes } from './features/expedientes/components/lista-expedientes/lista-expedientes';
import { DetalleExpediente } from './features/expedientes/components/detalle-expediente/detalle-expediente';
import { ListaDocumentos } from './features/expedientes/components/lista-documentos/lista-documentos';
import { DocumentosExpediente } from './features/expedientes/components/documentos-expediente/documentos-expediente';
import { HistorialComponent } from './features/expedientes/components/historial/historial';
import { NuevoExpediente } from './features/expedientes/components/nuevo-expediente/nuevo-expediente';
import { ConfiguracionComponent } from './features/configuracion/configuracion.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

const todos = ['Administrador', 'Abogado', 'Paralegal', 'Cliente'] as const;
const personal = ['Administrador', 'Abogado', 'Paralegal'] as const;

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, roleGuard([...personal])] },
  { path: 'cliente', component: ClienteDashboard, canActivate: [authGuard, roleGuard(['Cliente'])] },
  { path: 'expedientes', component: ListaExpedientes, canActivate: [authGuard, roleGuard([...todos])] },
  { path: 'expedientes/nuevo', component: NuevoExpediente, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'expedientes/:id_expediente', component: DetalleExpediente, canActivate: [authGuard, roleGuard([...todos])] },
  { path: 'expedientes/:id_expediente/historial', component: HistorialComponent, canActivate: [authGuard, roleGuard([...todos])] },
  { path: 'expedientes/:id_expediente/documentos', component: ListaDocumentos, canActivate: [authGuard, roleGuard([...todos])] },
  { path: 'expedientes/:id_expediente/documentos/subir', component: DocumentosExpediente, canActivate: [authGuard, roleGuard([...personal])] },
  { path: 'calendario', component: Calendario, canActivate: [authGuard, roleGuard([...todos])] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'usuarios/crear', component: CrearUsuarioComponent, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard, roleGuard(['Administrador', 'Abogado'])] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
