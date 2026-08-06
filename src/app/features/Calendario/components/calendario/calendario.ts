import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FullCalendarModule } from '@fullcalendar/angular';

import {
  CalendarOptions,
  EventClickArg,
  EventInput
} from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';

import { CitaService } from '../../../../core/services/cita.service';
import type { Cita } from '../../../../core/services/cita.service';

import { AuthService } from '../../../../core/services/auth.service';
import { ExpedienteService, Expediente } from '../../../../core/services/expediente';


@Component({
  selector: 'app-calendario',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule
  ],

  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})

export class Calendario implements OnInit {

  constructor(
    private citaService: CitaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private expedienteService: ExpedienteService 
  ) {}


  // Variables

  modalNuevaCitaAbierto = false;

  modoEdicion = false;

  idCitaEditando: string | null = null;

  citas: Cita[] = [];

  citaSeleccionada: Cita | null = null;
  expedientes: Expediente[] = [];


  // Usuario actual

  get usuarioActual() {
    return this.authService.getUser();
  }


  // Verificar administrador

  get esAdministrador(): boolean {
    return this.usuarioActual?.rol === 'Administrador';
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

    recordatorio_automatico: true

  };


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

    this.cargarCitas();
    this.cargarExpedientes(); // <-- ¡Esto faltaba!

  }


  // Cargar citas

  cargarCitas(): void {

    console.log('CARGANDO CITAS DESDE ANGULAR...');

    this.citaService.obtenerCitas().subscribe({

      next: (citas: Cita[]) => {

        console.log(
          'CITAS RECIBIDAS EN ANGULAR:',
          citas
        );

        console.log(
          'CANTIDAD DE CITAS:',
          citas.length
        );

        this.citas = citas;


        const eventos: EventInput[] =
          citas.map((cita) => {

            let color = '#4CAF50';


            if (cita.tipo_cita === 'Reunión') {

              color = '#2196F3';

            }

            else if (cita.tipo_cita === 'Trámite') {

              color = '#FF9800';

            }

            else if (cita.tipo_cita === 'Audiencia') {

              color = '#4CAF50';

            }


            const fecha =
              cita.fecha.split('T')[0];


            return {

              id: cita.id_cita ?? '',

              title: cita.titulo,

              start: fecha,

              allDay: true,

              color: color

            };

          });


        console.log(
          'EVENTOS PARA FULLCALENDAR:',
          eventos
        );


        this.calendarOptions = {

          ...this.calendarOptions,

          events: eventos

        };


        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'ERROR AL CARGAR CITAS EN ANGULAR:',
          error
        );

      }

    });

  }

 cargarExpedientes(): void {
    console.log('CARGANDO EXPEDIENTES DESDE ANGULAR...');

    this.expedienteService.obtenerExpedientes().subscribe({
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

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('ERROR AL CARGAR EXPEDIENTES:', error);
      }
    });
  }


  // Próximas citas

  get proximasCitas(): Cita[] {

    const hoy = new Date();

    hoy.setHours(
      0,
      0,
      0,
      0
    );


    return this.citas

      .filter((cita) => {

        const fecha =
          cita.fecha.split('T')[0];


        const [anio, mes, dia] =
          fecha
            .split('-')
            .map(Number);


        const fechaCita =
          new Date(
            anio,
            mes - 1,
            dia
          );


        return fechaCita >= hoy;

      })

      .sort((a, b) => {

        const fechaA =
          a.fecha.split('T')[0];

        const fechaB =
          b.fecha.split('T')[0];


        return fechaA.localeCompare(
          fechaB
        );

      })

      .slice(
        0,
        4
      );

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
        this.citaSeleccionada.recordatorio_automatico

    };


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

    return {

      id_expediente:
        this.nuevaCita.id_expediente || null,


      titulo:
        this.nuevaCita.titulo,


      tipo_cita:
        this.nuevaCita.tipo_cita,


      lugar_sala:
        this.nuevaCita.lugar_sala,


      fecha:
        this.nuevaCita.fecha,


      hora_inicio:
        this.nuevaCita.hora_inicio,


      duracion_estimada:
        this.nuevaCita.duracion_estimada,


      notas_recordatorio:
        this.nuevaCita.notas_recordatorio,


      recordatorio_automatico:
        this.nuevaCita.recordatorio_automatico

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

      recordatorio_automatico: true

    };

  }


  // Fecha para formulario

  obtenerFechaFormulario(
    fecha: string
  ): string {

    if (!fecha) {

      return '';

    }


    return fecha.split('T')[0];

  }


  // Hora para formulario

  obtenerHoraFormulario(
    hora: string
  ): string {

    if (!hora) {

      return '';

    }


    if (hora.includes('T')) {

      return hora
        .split('T')[1]
        .substring(0, 5);

    }


    return hora.substring(
      0,
      5
    );

  }


  // Formatear fecha

  formatearFecha(
    fecha: string
  ): string {

    if (!fecha) {

      return '';

    }


    const fechaSinHora =
      fecha.split('T')[0];


    const partes =
      fechaSinHora.split('-');


    const fechaLocal =
      new Date(

        Number(partes[0]),

        Number(partes[1]) - 1,

        Number(partes[2])

      );


    const texto =
      fechaLocal.toLocaleDateString(

        'es-ES',

        {

          weekday: 'long',

          day: 'numeric',

          month: 'long',

          year: 'numeric'

        }

      );


    return (
      texto.charAt(0).toUpperCase() +
      texto.slice(1)
    );

  }


  // Formatear hora

  formatearHora(
    hora: string
  ): string {

    if (!hora) {

      return '';

    }


    if (hora.includes('T')) {

      return hora
        .split('T')[1]
        .substring(0, 5);

    }


    return hora.substring(
      0,
      5
    );

  }

}