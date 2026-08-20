import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { ExpedienteService, Expediente, ParteInvolucrada } from '../../../../core/services/expediente'; 
import { HistorialService, EventoHistorial } from '../../../../core/services/historial.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioService, Usuario } from '../../../../core/services/usuario.service'; // IMPORTACIÓN DEL SERVICIO
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { 
  heroArrowLeft, 
  heroDocumentText,
  heroInformationCircle,
  heroUsers,
  heroUser,
  heroBriefcase,
  heroPencilSquare,
  heroClock
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-detalle-expediente',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    NgIconComponent, 
    SharedHeader
  ], 
  viewProviders: [provideIcons({ 
    heroArrowLeft,heroDocumentText,heroInformationCircle,heroUsers,heroBriefcase,heroUser,heroPencilSquare,heroClock
  })],
  templateUrl: './detalle-expediente.html',
  styleUrls: ['./detalle-expediente.css']
})
export class DetalleExpediente implements OnInit {
  expediente: Expediente | null = null;
  cargando: boolean = true;
  error: string | null = null;
  actividadesRecientes: EventoHistorial[] = [];

  // --- VARIABLES PARA EL MODAL DE EDICIÓN ---
  mostrarModalEdicion: boolean = false;
  expedienteEdicion: Partial<Expediente> = {};
  guardandoEdicion: boolean = false;
  pestanaEdicion: 'general' | 'partes' | 'equipo' = 'general';
  usuariosDisponibles: Array<{ id_usuario: string; nombre: string; rol: string }> = [];
  listaClientes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private expedienteService: ExpedienteService,
    private historialService: HistorialService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private usuarioService: UsuarioService // INYECCIÓN DEL SERVICIO
  ) {}

  get esAdministrador(): boolean {
    return this.authService.getUser()?.rol === 'Administrador';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id_expediente') || params.get('id');
        if (id) {
          this.cargarDetalle(id);
        } else {
          this.error = 'No se encontró un ID de expediente válido.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      }
    });
    this.cargarUsuariosDisponibles();
  }

  cargarDetalle(id: string): void {
    this.cargando = true;
    this.error = null;

    this.expedienteService.obtenerExpediente(id).subscribe({
      next: (data: Expediente) => {
        this.expediente = data;
        this.cargarActividadReciente(id);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al obtener detalle:', err);
        this.error = 'Ocurrió un error al cargar la información del expediente.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarActividadReciente(idExpediente: string): void {
    this.historialService.obtenerHistorial(idExpediente, 'Todos', 1, 3).subscribe({
      next: (data) => {
        this.actividadesRecientes = data.historial || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al obtener historial reciente:', err);
        this.actividadesRecientes = []; 
      }
    });
  }
  
  // 2. REEMPLAZA EL MÉTODO cargarUsuariosDisponibles():
cargarUsuariosDisponibles(): void {
  this.usuarioService.obtenerUsuarios().subscribe({
    next: (res) => {
      // Filtramos Abogados y Paralegales para el equipo
      this.usuariosDisponibles = res.filter(
        (u) => u.rol === 'Abogado' || u.rol === 'Paralegal'
      );
      
      // NUEVO: Filtramos a los Clientes para el dropdown
      this.listaClientes = res.filter(
        (u) => u.rol === 'Cliente'
      );
    },
    error: (err) => console.error('Error al cargar la lista de usuarios:', err)
  });
}

// 3. AGREGA ESTA NUEVA FUNCIÓN (puedes ponerla justo debajo de cargarUsuariosDisponibles):
onClienteSeleccionado(event: any, parte: any): void {
  const idCliente = event.target.value;
  const cliente = this.listaClientes.find(c => c.id_usuario === idCliente);
  
  if (cliente) {
    // Autorrellenamos los datos en la fila específica de la "Parte"
    parte.nombre_completo = cliente.nombre;
    parte.correo_contacto = cliente.correo_electronico || cliente.correo || '';
    
    // Y muy importante: actualizamos el id_cliente general del expediente para la base de datos
    this.expedienteEdicion.id_cliente = idCliente;
  }
}

  // --- MÉTODOS PARA EL MODAL DE EDICIÓN ---

  abrirModalEditar(): void {
    if (!this.expediente) return;

    this.expedienteEdicion = JSON.parse(JSON.stringify(this.expediente));
    
    if (!this.expedienteEdicion.partes_involucradas) {
      this.expedienteEdicion.partes_involucradas = [];
    }
    if (!this.expedienteEdicion.equipo) {
      this.expedienteEdicion.equipo = [];
    }

    this.pestanaEdicion = 'general';
    this.mostrarModalEdicion = true;
  }

  agregarParte(): void {
    if (!this.expedienteEdicion.partes_involucradas) {
      this.expedienteEdicion.partes_involucradas = [];
    }
    this.expedienteEdicion.partes_involucradas.push({
      clasificacion: 'Demandante',
      tipo_persona: 'Física',
      nombre_completo: '',
      identificacion: '',
      correo_contacto: '',
      direccion: ''
    });
  }

  eliminarParte(index: number): void {
    this.expedienteEdicion.partes_involucradas?.splice(index, 1);
  }

  agregarMiembroEquipo(): void {
    if (!this.expedienteEdicion.equipo) {
      this.expedienteEdicion.equipo = [];
    }
    this.expedienteEdicion.equipo.push({
      id_usuario: '',
      rol_en_caso: 'Abogado',
      user: { id_usuario: '', nombre: '', correo: '', rol: '' }
    });
  }

  eliminarMiembroEquipo(index: number): void {
    this.expedienteEdicion.equipo?.splice(index, 1);
  }

  cerrarModalEditar(): void {
    this.mostrarModalEdicion = false;
    this.expedienteEdicion = {};
  }

  guardarEdicion(): void {
    if (!this.expediente?.id_expediente) return;

    this.guardandoEdicion = true;

    this.expedienteService.actualizarExpediente(this.expediente.id_expediente, this.expedienteEdicion).subscribe({
      next: (res: any) => {
        try {
          // 1. Verificamos si el backend envió el objeto envuelto con un "message" o directo
          const expedienteActualizado = res.expediente ? res.expediente : res;

          // 2. Actualizamos el estado local de forma segura
          this.expediente = {
            ...this.expediente,
            ...expedienteActualizado
          };

          // 3. Apagamos el estado de carga y cerramos el modal
          this.guardandoEdicion = false;
          this.cerrarModalEditar();
          
          // 4. Forzamos la actualización visual
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error interno al actualizar la vista:', error);
          // Asegurarnos de apagar el spinner incluso si algo falla en la vista
          this.guardandoEdicion = false;
          this.cerrarModalEditar();
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error de red o de servidor al actualizar:', err);
        alert('Ocurrió un error al intentar guardar los cambios.');
        this.guardandoEdicion = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerPartes(): ParteInvolucrada[] {
    if (!this.expediente) return [];
    return this.expediente.partes_involucradas || this.expediente.partes || [];
  }

  obtenerNombreDemandante(): string {
    if (!this.expediente) return 'Cargando...';
    const partes = this.obtenerPartes();
    const demandante = partes.find(p => p.clasificacion?.toLowerCase() === 'demandante');
    return demandante ? demandante.nombre_completo : (this.expediente.cliente?.nombre || 'Cliente no especificado');
  }

// --- VALIDACIONES DE EQUIPO ---

  // Obtener usuarios filtrando por rol y ocultando los que YA están asignados
  obtenerUsuariosPorRol(rol: string | undefined, idUsuarioActual: string | undefined): Array<{ id_usuario: string; nombre: string; rol: string }> {
    if (!rol) return [];

    // Recolectamos los IDs que ya están seleccionados en otras filas
    const idsSeleccionados = (this.expedienteEdicion.equipo || [])
      .map(m => m.id_usuario)
      .filter(id => id && id !== idUsuarioActual); // Excluimos el ID de la fila actual para que siga seleccionado

    return this.usuariosDisponibles.filter(
      (usuario) => usuario.rol.toLowerCase() === rol.toLowerCase() && !idsSeleccionados.includes(usuario.id_usuario)
    );
  }

  get excedioAbogados(): boolean {
    const total = this.expedienteEdicion.equipo?.filter(m => m.rol_en_caso === 'Abogado').length || 0;
    return total > 2;
  }

  get excedioParalegales(): boolean {
    const total = this.expedienteEdicion.equipo?.filter(m => m.rol_en_caso === 'Paralegal').length || 0;
    return total > 2;
  }

  // --- VALIDACIONES DE PARTES INVOLUCRADAS ---

  get tienePartesDuplicadas(): boolean {
    const identificaciones = (this.expedienteEdicion.partes_involucradas || [])
      .map(p => p.identificacion?.trim().toLowerCase())
      .filter(id => id && id.length > 0);
    
    // Si el Set (que elimina duplicados) tiene un tamaño menor al array original, hay duplicados
    return new Set(identificaciones).size !== identificaciones.length;
  }

  get tieneCamposVacios(): boolean {
    // Validar que no existan filas de equipo sin usuario
    const equipoIncompleto = (this.expedienteEdicion.equipo || []).some(m => !m.id_usuario);
    
    // Validar que las partes tengan al menos nombre e identificación
    const partesIncompletas = (this.expedienteEdicion.partes_involucradas || []).some(p => !p.nombre_completo || !p.identificacion);

    return equipoIncompleto || partesIncompletas;
  }

  // --- VALIDACIÓN GENERAL PARA GUARDAR ---
  get esFormularioValido(): boolean {
    return !this.excedioAbogados && 
           !this.excedioParalegales && 
           !this.tienePartesDuplicadas && 
           !this.tieneCamposVacios;
  }

// Limpia el usuario seleccionado si el usuario actual no corresponde al nuevo rol elegido
onRolCasoChange(miembro: any): void {
  const usuarioActual = this.usuariosDisponibles.find(
    (u) => u.id_usuario === miembro.id_usuario
  );

  if (usuarioActual && usuarioActual.rol.toLowerCase() !== miembro.rol_en_caso?.toLowerCase()) {
    miembro.id_usuario = '';
  }
}
}