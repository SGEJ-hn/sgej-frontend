import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FullCalendarModule } from '@fullcalendar/angular';

import {
  CalendarOptions,
  EventClickArg,
  EventInput
} from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlus, heroMagnifyingGlass } from '@ng-icons/heroicons/outline';

import { CitaService } from '../../../../core/services/cita.service';
import type { Cita } from '../../../../core/services/cita.service';

import { AuthService } from '../../../../core/services/auth.service';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';


@Component({
  selector: 'app-calendario',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    SharedHeader,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroPlus, heroMagnifyingGlass })],

  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})

export class Calendario implements OnInit {

  constructor(
    private citaService: CitaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private expedienteService: ExpedienteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.esNavegador = isPlatformBrowser(this.platformId);
  }

  // Variables

  modalNuevaCitaAbierto = false;
  modoEdicion = false;
  idCitaEditando: string | null = null;
  citas: Cita[] = [];
  citaSeleccionada: Cita | null = null;
  expedientes: Expediente[] = [];
  esNavegador: boolean = false;
  terminoBusqueda: string = '';
  filtroDias: number = 30;
  nuevoParticipante: string = '';


  // Usuario actual

  get usuarioActual() {
    return this.authService.getUser();
  }


  // Verificar administrador

  get esAdministrador(): boolean {
    return this.usuarioActual?.rol === 'Administrador';
  }

  // Obtener mes y año actuales dinámicamente para el subtítulo
  get mesAnioActual(): string {
    const fecha = new Date();
    
    // Obtenemos el mes en texto (ej. "julio")
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    const anio = fecha.getFullYear();
    
    // Capitalizamos la primera letra y unimos con el año
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)} de ${anio}`;
  }

// Se ejecuta cuando el usuario cambia el expediente
  cargarPersonasExpediente(): void {
    const idExp = this.nuevaCita.id_expediente;
    this.personaSeleccionada = ''; 
    this.personasDisponibles = []; 

    if (!idExp) {
      return;
    }

    // Buscamos directamente en el arreglo que ya se descargó al inicio
    const expedienteEncontrado = this.expedientes.find(
      (exp: any) => exp.id_expediente === idExp
    );

    if (expedienteEncontrado) {
      const nombresSet = new Set<string>(); 

      // 1. Extraer Cliente (Gisela Perez, según tu consola)
      if (expedienteEncontrado.cliente && expedienteEncontrado.cliente.nombre) {
        nombresSet.add(`${expedienteEncontrado.cliente.nombre} (Cliente)`);
      }

      // 2. Extraer Equipo (Pedro Martinez, según tu consola)
      if (expedienteEncontrado.equipo && expedienteEncontrado.equipo.length > 0) {
        expedienteEncontrado.equipo.forEach((miembro: any) => {
          const nombre = miembro.user?.nombre || miembro.usuario?.nombre; 
          const rol = miembro.rol_en_caso ? ` (${miembro.rol_en_caso})` : ' (Equipo)';
          if (nombre) nombresSet.add(`${nombre}${rol}`);
        });
      }

      // 3. Extraer Partes Involucradas (Corregimos el nombre de la variable aquí)
      if (expedienteEncontrado.partes_involucradas && expedienteEncontrado.partes_involucradas.length > 0) {
        expedienteEncontrado.partes_involucradas.forEach((parte: any) => {
          if (parte.nombre_completo) {
            const clasificacion = parte.clasificacion ? ` (${parte.clasificacion})` : ' (Parte)';
            nombresSet.add(`${parte.nombre_completo}${clasificacion}`);
          }
        });
      }

      // Pasamos los nombres encontrados a la lista desplegable
      this.personasDisponibles = Array.from(nombresSet);
      
      // Le decimos a Angular que refresque la pantalla
      this.cdr.detectChanges();
    }
  }

  // Formulario

  nuevaCita = {

    id_expediente: '',
    titulo: '',
    tipo_cita: '',
    lugar_sala: '',
    fecha: '',
    hora_inicio: '',
    duracion_estimada: '',
    notas_recordatorio: '',
    recordatorio_automatico: true,
    participantes: [] as string[]

  };

  // Variables para la lista desplegable de participantes
  personasDisponibles: string[] = []; 
  personaSeleccionada: string = '';

  // Agregar un participante desde la lista desplegable
  // Agregar un participante desde la lista desplegable
  agregarParticipante(): void {
    console.log('Intentando agregar a:', this.personaSeleccionada);
    
    // Red de seguridad por si el arreglo no existe
    if (!this.nuevaCita.participantes) {
      this.nuevaCita.participantes = [];
    }

    if (this.personaSeleccionada && !this.nuevaCita.participantes.includes(this.personaSeleccionada)) {
      this.nuevaCita.participantes.push(this.personaSeleccionada);
      this.personaSeleccionada = ''; // Limpiamos el select después de agregar
    } else if (this.nuevaCita.participantes.includes(this.personaSeleccionada)) {
      alert('Este participante ya fue agregado a la cita.');
    }
  }

  // Quitar un participante de la lista
  removerParticipante(index: number): void {
    this.nuevaCita.participantes.splice(index, 1);
  }


  // Calendario

  calendarOptions: CalendarOptions = {

    plugins: [
      dayGridPlugin
    ],

    initialView: 'dayGridMonth',

    locale: esLocale,

    height: 'auto',

    contentHeight: 'auto',

    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },

    eventDisplay: 'list-item',

    events: [],


    // Seleccionar evento

    eventClick: (info: EventClickArg) => {

      const id = info.event.id;

      const cita = this.citas.find(
        item => item.id_cita === id
      );

      if (cita) {

        this.citaSeleccionada = cita;

        this.cdr.detectChanges();

      }

    },


    // Día actual

    dayCellDidMount: (arg) => {

      if (!arg.isToday) {
        return;
      }

      const numero = arg.el.querySelector(
        '.fc-daygrid-day-number'
      ) as HTMLElement;

      if (numero) {

        numero.style.background = '#5b1f2b';

        numero.style.color = 'white';

        numero.style.width = '36px';

        numero.style.height = '36px';

        numero.style.display = 'flex';

        numero.style.alignItems = 'center';

        numero.style.justifyContent = 'center';

        numero.style.borderRadius = '2px';

        numero.style.margin = '6px';

      }

    }

  };
  


  // Inicio

  ngOnInit(): void {
    this.cargarExpedientes();
    this.cargarCitas();
  }


  // Cargar citas
  cargarCitas(): void {
    this.citaService.obtenerCitas().subscribe({
      next: (citas: Cita[]) => {
        // 🔥 EL TRUCO MAESTRO 🔥
        this.citas = citas.map(cita => {
          // Extraemos estrictamente el día (Ej: "2026-08-20")
          const soloFecha = cita.fecha.split('T')[0];
          return {
            ...cita,
            // Le pegamos el mediodía LOCAL. Esto evita que los Pipes de Angular
            // o FullCalendar te regresen al día 19.
            fecha: `${soloFecha}T12:00:00`
          };
        });
        
        this.actualizarEventosCalendario();
      },
      error: (error) => {
        console.error('ERROR AL CARGAR CITAS:', error);
      }
    });
  }

  // Filtrar y dibujar eventos en el calendario
  actualizarEventosCalendario(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();

    const citasFiltradas = this.citas.filter(cita => {
      if (!termino) return true;
      const numeroExpediente = this.obtenerNumeroExpediente(cita.id_expediente).toLowerCase();
      return numeroExpediente.includes(termino);
    });

    const eventos: EventInput[] = citasFiltradas.map((cita) => {
      let color = '#4CAF50'; 
      if (cita.tipo_cita === 'Reunión') color = '#2196F3';
      else if (cita.tipo_cita === 'Trámite') color = '#FF9800';

      const numeroExpediente = this.obtenerNumeroExpediente(cita.id_expediente);
      const tituloMostrar = cita.id_expediente ? numeroExpediente : cita.titulo;

      return {
        id: cita.id_cita ?? '',
        title: tituloMostrar,
        // Al hacer split, sacamos exactamente el día "2026-08-20" para el calendario
        start: cita.fecha.split('T')[0], 
        allDay: true,
        color: color
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: eventos
    };
    this.cdr.detectChanges();
  }

  // Método que se dispara cada vez que el usuario escribe en el input
  filtrarCitas(): void {
    this.actualizarEventosCalendario();
  }

 cargarExpedientes(): void {
    console.log('CARGANDO EXPEDIENTES DESDE ANGULAR...');

    // 🔥 SOLUCIÓN: Pedimos la página 1, con un límite de 1000 expedientes
    this.expedienteService.obtenerExpedientes(1, 1000).subscribe({
      next: (respuesta: any) => {
        console.log('EXPEDIENTES RECIBIDOS:', respuesta);

        // Validar si la respuesta es un arreglo directo o viene dentro de una propiedad
        if (Array.isArray(respuesta)) {
          this.expedientes = respuesta;
        } else if (respuesta && Array.isArray(respuesta.expedientes)) {
          this.expedientes = respuesta.expedientes;
        } else if (respuesta && Array.isArray(respuesta.data)) {
          this.expedientes = respuesta.data;
        } else {
          this.expedientes = [];
        }

        // 👇 AHORA SÍ, CARGAMOS LAS CITAS 👇
        this.cargarCitas();
      },
      error: (error) => {
        console.error('ERROR AL CARGAR EXPEDIENTES:', error);
        this.cargarCitas();
      }
    });
  }

  // Variables para el nuevo dropdown personalizado
  expedienteDropdownAbierto = false;

  // Método para seleccionar el expediente y cerrar el dropdown
  seleccionarExpedienteDropdown(idExpediente: string | undefined): void {
    this.nuevaCita.id_expediente = idExpediente || '';
    this.expedienteDropdownAbierto = false;
    this.cargarPersonasExpediente(); // Mantiene la lógica que ya tenías
  }

  // Método para mostrar el texto seleccionado en el botón
  obtenerTextoExpedienteSeleccionado(): string {
    if (!this.nuevaCita.id_expediente) return 'Seleccione un expediente (Opcional)';
    
    const exp = this.expedientes.find(e => e.id_expediente === this.nuevaCita.id_expediente);
    return exp 
      ? `${exp.numero_expediente} - ${exp.materia} (${exp.tribunal_juzgado})` 
      : 'Seleccione un expediente (Opcional)';
  }


 // Próximas citas
  get proximasCitas(): Cita[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(fechaLimite.getDate() + Number(this.filtroDias)); 
    fechaLimite.setHours(23, 59, 59, 999);

    const termino = this.terminoBusqueda.toLowerCase().trim();

    return this.citas
      .filter((cita) => {
        // Al crear la fecha desde nuestro string con "T12:00:00", es 100% precisa
        const fechaCita = new Date(cita.fecha);
        fechaCita.setHours(0,0,0,0);
        
        let coincideBusqueda = true;
        if (termino) {
          const numeroExpediente = this.obtenerNumeroExpediente(cita.id_expediente).toLowerCase();
          coincideBusqueda = numeroExpediente.includes(termino);
        }

        return fechaCita >= hoy && fechaCita <= fechaLimite && coincideBusqueda;
      })
      .sort((a, b) => {
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      })
      .slice(0, 4); 
  }


  // Seleccionar cita

  seleccionarCita(
    cita: Cita
  ): void {

    this.citaSeleccionada = cita;

  }


  // Abrir nueva cita

  abrirModalNuevaCita(): void {

    if (!this.esAdministrador) {
      return;
    }


    this.modoEdicion = false;

    this.idCitaEditando = null;

    this.limpiarFormulario();

    this.modalNuevaCitaAbierto = true;

  }


  // Abrir edición

  abrirModalEditar(): void {

    if (!this.esAdministrador) {
      return;
    }


    if (!this.citaSeleccionada) {

      alert(
        'Selecciona una cita.'
      );

      return;

    }


    if (!this.citaSeleccionada.id_cita) {

      alert(
        'No se encontró el ID de la cita.'
      );

      return;

    }


    this.modoEdicion = true;


    this.idCitaEditando =
      this.citaSeleccionada.id_cita;


    this.nuevaCita = {

      id_expediente:
        this.citaSeleccionada.id_expediente ?? '',


      titulo:
        this.citaSeleccionada.titulo,


      tipo_cita:
        this.citaSeleccionada.tipo_cita,


      lugar_sala:
        this.citaSeleccionada.lugar_sala ?? '',


      fecha:
        this.obtenerFechaFormulario(
          this.citaSeleccionada.fecha
        ),


      hora_inicio:
        this.obtenerHoraFormulario(
          this.citaSeleccionada.hora_inicio
        ),


      duracion_estimada:
        this.citaSeleccionada.duracion_estimada ?? '',


      notas_recordatorio:
        this.citaSeleccionada.notas_recordatorio ?? '',


      recordatorio_automatico:
        this.citaSeleccionada.recordatorio_automatico,
      
      participantes: this.citaSeleccionada.participantes
        ? this.citaSeleccionada.participantes.map((p: any) => typeof p === 'string' ? p : p.nombre_participante)
        : []
        
    };

    // 🔥 Agrega esta línea para que cargue la lista si la cita tiene expediente
    this.cargarPersonasExpediente(); 

    this.modalNuevaCitaAbierto = true;
    

  }


  // Cerrar modal

  cerrarModalNuevaCita(): void {

    this.modalNuevaCitaAbierto = false;

    this.modoEdicion = false;

    this.idCitaEditando = null;

    this.limpiarFormulario();

  }


  // Guardar formulario

  guardarCita(): void {

    if (!this.esAdministrador) {
      return;
    }


    if (
      !this.nuevaCita.titulo ||
      !this.nuevaCita.tipo_cita ||
      !this.nuevaCita.fecha ||
      !this.nuevaCita.hora_inicio
    ) {

      alert(
        'Completa los campos obligatorios.'
      );

      return;

    }


    if (this.modoEdicion) {

      this.actualizarCita();

    }

    else {

      this.crearCita();

    }

  }


  // Crear cita

  crearCita(): void {

    if (!this.esAdministrador) {
      return;
    }


    const cita =
      this.prepararCita();


    this.citaService
      .crearCita(cita)
      .subscribe({

        next: () => {

          alert(
            'Cita creada correctamente'
          );


          this.cerrarModalNuevaCita();

          this.cargarCitas();

        },


        error: (error) => {

          console.error(
            'Error al crear cita:',
            error
          );


          alert(
            'No se pudo crear la cita.'
          );

        }

      });

  }


  // Actualizar cita

  actualizarCita(): void {

    if (!this.esAdministrador) {
      return;
    }


    if (!this.idCitaEditando) {

      alert(
        'No se encontró la cita a editar.'
      );

      return;

    }


    const cita =
      this.prepararCita();


    this.citaService
      .actualizarCita(
        this.idCitaEditando,
        cita
      )
      .subscribe({

        next: () => {

          alert(
            'Cita actualizada correctamente'
          );


          this.cerrarModalNuevaCita();


          this.citaSeleccionada = null;


          this.cargarCitas();

        },


        error: (error) => {

          console.error(
            'Error al actualizar la cita:',
            error
          );


          alert(
            'No se pudo actualizar la cita.'
          );

        }

      });

  }


  // Preparar cita
  prepararCita(): Cita {
    let fechaSegura = this.nuevaCita.fecha;
    if (fechaSegura && !fechaSegura.includes('T')) {
      fechaSegura = `${fechaSegura}T12:00:00.000Z`;
    }

    return {
      id_expediente: this.nuevaCita.id_expediente || null,
      titulo: this.nuevaCita.titulo,
      tipo_cita: this.nuevaCita.tipo_cita,
      lugar_sala: this.nuevaCita.lugar_sala,
      fecha: fechaSegura,
      hora_inicio: this.nuevaCita.hora_inicio,
      duracion_estimada: this.nuevaCita.duracion_estimada,
      notas_recordatorio: this.nuevaCita.notas_recordatorio,
      recordatorio_automatico: this.nuevaCita.recordatorio_automatico,
      participantes: this.nuevaCita.participantes
    };
  }


  // Eliminar cita

  eliminarCita(): void {

    if (!this.esAdministrador) {
      return;
    }


    if (!this.citaSeleccionada?.id_cita) {

      alert(
        'Selecciona una cita.'
      );

      return;

    }


    const confirmar =
      confirm(
        `¿Deseas eliminar la cita "${this.citaSeleccionada.titulo}"?`
      );


    if (!confirmar) {

      return;

    }


    const id =
      this.citaSeleccionada.id_cita;


    this.citaService
      .eliminarCita(id)
      .subscribe({

        next: () => {

          alert(
            'Cita eliminada correctamente'
          );


          this.citaSeleccionada = null;


          this.cargarCitas();

        },


        error: (error) => {

          console.error(
            'Error al eliminar la cita:',
            error
          );


          alert(
            'No se pudo eliminar la cita.'
          );

        }

      });

  }


  // Limpiar formulario

  limpiarFormulario(): void {

    this.nuevaCita = {

      id_expediente: '',

      titulo: '',

      tipo_cita: '',

      lugar_sala: '',

      fecha: '',

      hora_inicio: '',

      duracion_estimada: '',

      notas_recordatorio: '',

      recordatorio_automatico: true,
      participantes: []
    };

    this.nuevoParticipante = '';    
    this.personasDisponibles = [];
    this.personaSeleccionada = '';
  }

// Fecha para formulario
  obtenerFechaFormulario(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha.split('T')[0]; // Fallback
    
    const anio = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const dia = date.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  // Hora para formulario
  obtenerHoraFormulario(hora: string): string {
    if (!hora) return '';
    const date = new Date(hora);
    if (isNaN(date.getTime())) {
      return hora.includes('T') ? hora.split('T')[1].substring(0, 5) : hora.substring(0, 5);
    }
    
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  // Formatear fecha para la vista de detalle
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha;

    const texto = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  // Formatear hora para la vista de detalle
  formatearHora(hora: string): string {
    if (!hora) return '';
    const date = new Date(hora);
    if (isNaN(date.getTime())) {
      return hora.includes('T') ? hora.split('T')[1].substring(0, 5) : hora.substring(0, 5);
    }
    
    // Le damos formato de 12 hrs (ej: 06:00 PM) para que coincida con el Dashboard
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Obtener número de expediente visualmente a partir del ID
  obtenerNumeroExpediente(idExpediente: string | null | undefined): string {
    if (!idExpediente) {
      return 'Sin expediente asociado';
    }

    const expedienteEncontrado = this.expedientes.find(
      (exp) => exp.id_expediente === idExpediente
    );

    return expedienteEncontrado ? expedienteEncontrado.numero_expediente : 'Expediente no encontrado';
  }
}

