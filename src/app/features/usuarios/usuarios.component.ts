import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedHeader } from '../../shared/components/shared-header/shared-header';
import { UsuarioService, Usuario } from '../../core/services/usuario.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
  heroPlus,
  heroUserGroup,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedHeader, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroMagnifyingGlass,
      heroPencilSquare,
      heroTrash,
      heroPlus,
      heroUserGroup,
    }),
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;
  mensajeExito = '';
  mensajeError = '';

  // Filtros
  busqueda = '';
  filtroRol = '';
  filtroEstado = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    const filtros: any = {};
    if (this.filtroRol) filtros.rol = this.filtroRol;
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.busqueda.trim()) filtros.busqueda = this.busqueda.trim();

    this.usuarioService.obtenerUsuarios(filtros).subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
        this.mensajeError = 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
      },
    });
  }

  aplicarFiltros(): void {
    this.cargarUsuarios();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroRol = '';
    this.filtroEstado = '';
    this.cargarUsuarios();
  }

  irACrearUsuario(): void {
    this.router.navigate(['/usuarios/crear']);
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmacion = confirm(
      `¿Está seguro de eliminar al usuario "${usuario.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    this.usuarioService.eliminarUsuario(usuario.id_usuario).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.message || 'Usuario eliminado exitosamente.';
        this.cargarUsuarios();
        setTimeout(() => (this.mensajeExito = ''), 4000);
      },
      error: (err: any) => {
        this.mensajeError = err.error?.error || 'Error al eliminar el usuario.';
        setTimeout(() => (this.mensajeError = ''), 4000);
      },
    });
  }

  // Helpers para la vista
  getBadgeClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'badge-activo';
      case 'inactivo':
        return 'badge-inactivo';
      case 'suspendido':
        return 'badge-suspendido';
      default:
        return 'badge-default';
    }
  }

  getRolIcon(rol: string): string {
    switch (rol) {
      case 'Administrador':
        return '👑';
      case 'Abogado':
        return '⚖️';
      case 'Cliente':
        return '👤';
      default:
        return '🔹';
    }
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'Sin registro';
    return new Date(fecha).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get totalActivos(): number {
    return this.usuarios.filter((u) => u.estado === 'Activo').length;
  }

  get totalInactivos(): number {
    return this.usuarios.filter((u) => u.estado === 'Inactivo').length;
  }
}
