import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedHeader } from '../../shared/components/shared-header/shared-header';
import { UsuarioService, Usuario, UsuariosResponse } from '../../core/services/usuario.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
  heroPlus,
  heroUserGroup,
  heroCheckCircle,
  heroMinusCircle
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
      heroCheckCircle,
      heroMinusCircle
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
  mostrarModalEdicion = false;
  guardandoEdicion = false;
  usuarioEnEdicion: Partial<Usuario> = {};

  // Filtros
  busqueda = '';
  filtroRol = '';
  filtroEstado = '';
  
  // Paginación y KPIs globales
  paginaActual: number = 1;
  limite: number = 8;
  totalPaginas: number = 1;
  totalEntradas: number = 0;
  totalActivos: number = 0;   // <-- NUEVA VARIABLE
  totalInactivos: number = 0; // <-- NUEVA VARIABLE

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

 cargarUsuarios(): void {
    // 1. Forzamos la vista para que muestre el estado "cargando" inmediatamente
    this.cargando = true;
    this.cdr.detectChanges(); 

    const filtros: any = {};
    if (this.filtroRol) filtros.rol = this.filtroRol;
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.busqueda.trim()) filtros.busqueda = this.busqueda.trim();

    this.usuarioService.obtenerUsuariosPaginados(this.paginaActual, this.limite, filtros).subscribe({
      next: (res: UsuariosResponse) => {
        this.usuarios = res.usuarios || [];
        this.totalEntradas = res.total || 0;
        this.totalActivos = res.total_activos || 0;
        this.totalInactivos = res.total_inactivos || 0;
        this.totalPaginas = res.total_paginas || 1;
        this.cargando = false;
        
        // 2. FORZAMOS LA ACTUALIZACIÓN DE LA VISTA AQUÍ
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
        this.usuarios = [];
        this.mensajeError = 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
        
        // 3. Y TAMBIÉN EN CASO DE ERROR
        this.cdr.detectChanges();
      },
    });
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroRol = '';
    this.filtroEstado = '';
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarUsuarios();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarUsuarios();
    }
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
        
        setTimeout(() => {
          this.mensajeExito = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        this.mensajeError = err.error?.error || 'Error al eliminar el usuario.';
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.mensajeError = '';
          this.cdr.detectChanges();
        }, 4000);
      },
    });
  }

  // Helpers para la vista
  getBadgeClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-medium';
      case 'inactivo':
        return 'bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-medium';
      case 'suspendido':
        return 'bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-medium';
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

  // --- MÉTODOS PARA EDICIÓN DE USUARIO ---

  abrirModalEdicion(usuario: Usuario): void {
    this.usuarioEnEdicion = { ...usuario };
    this.mostrarModalEdicion = true;
  }

  cerrarModalEdicion(): void {
    this.mostrarModalEdicion = false;
    this.usuarioEnEdicion = {};
  }

  guardarEdicion(): void {
    if (!this.usuarioEnEdicion.id_usuario) return;

    this.guardandoEdicion = true;
    
    const datosActualizados = {
      nombre: this.usuarioEnEdicion.nombre,
      correo: this.usuarioEnEdicion.correo,
      rol: this.usuarioEnEdicion.rol,
      estado: this.usuarioEnEdicion.estado
    };

    this.usuarioService.actualizarUsuario(this.usuarioEnEdicion.id_usuario, datosActualizados)
      .subscribe({
        next: (res) => {
          this.mensajeExito = res.message || 'Usuario actualizado exitosamente.';
          this.cerrarModalEdicion();
          this.cargarUsuarios(); 
          this.guardandoEdicion = false;
          
          setTimeout(() => {
            this.mensajeExito = '';
            this.cdr.detectChanges();
          }, 4000);
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.mensajeError = err.error?.error || 'Error al actualizar el usuario.';
          this.guardandoEdicion = false;
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.mensajeError = '';
            this.cdr.detectChanges();
          }, 4000);
        }
      });
  }
}