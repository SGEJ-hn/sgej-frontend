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
  imports: [CommonModule],
  template: `
    <div class="p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-[#4B1623]">Gestión de Usuarios</h1>
        <button class="bg-[#4B1623] text-white px-4 py-2 rounded shadow hover:bg-[#3a111b] transition">
          + Agregar Usuario
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-700 border-b border-gray-200">
              <th class="p-4 font-semibold">Nombre</th>
              <th class="p-4 font-semibold">Correo</th>
              <th class="p-4 font-semibold">Rol</th>
              <th class="p-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="p-4 font-medium text-gray-900">Carlos Mendoza</td>
              <td class="p-4">cmendoza&#64;justice.law</td>
              <td class="p-4">Administrador</td>
              <td class="p-4 text-[#4B1623] cursor-pointer hover:underline">Editar</td>
            </tr>
            <tr class="hover:bg-gray-50 transition">
              <td class="p-4 font-medium text-gray-900">Ana Lucía Ramírez</td>
              <td class="p-4">aramirez&#64;justice.law</td>
              <td class="p-4">Abogado Junior</td>
              <td class="p-4 text-[#4B1623] cursor-pointer hover:underline">Editar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UsuariosComponent {}
