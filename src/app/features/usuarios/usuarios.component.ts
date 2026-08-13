import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inyectamos esto para la actualización inmediata
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
        this.cdr.detectChanges(); // Obliga a la pantalla a actualizarse al instante
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
        this.mensajeError = 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
        this.cdr.detectChanges(); // Obliga a la pantalla a actualizarse al instante
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

  get totalActivos(): number {
    return this.usuarios.filter((u) => u.estado === 'Activo').length;
  }

  get totalInactivos(): number {
    return this.usuarios.filter((u) => u.estado === 'Inactivo').length;
  }

  // --- MÉTODOS PARA EDICIÓN DE USUARIO ---

  abrirModalEdicion(usuario: Usuario): void {
    // Hacemos una copia del usuario para no afectar la tabla directamente hasta que se guarde
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
    
    // Preparamos los datos según lo que pide el Partial<CrearUsuarioDto> de tu servicio
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
          this.cargarUsuarios(); // Recargamos la tabla para ver los cambios
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