import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReporteService,
  EstadisticasReportes
} from '../../core/services/reporte.service';

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx-js-style';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],

  template: `

    <div class="p-6">

      <!-- =========================================
           ENCABEZADO
           ========================================= -->

      <div class="mb-8">

        <h1 class="text-3xl font-bold text-gray-800">
          Reportes y Estadísticas
        </h1>

        <p class="text-gray-500 mt-1">
          Resumen general de la información del sistema
        </p>

      </div>

      <!-- =========================================
     BOTONES DE EXPORTACIÓN
     ========================================= -->

      <div class="flex flex-wrap gap-3 mb-8">

      <!-- Exportar PDF -->

     <button
      type="button"
      (click)="exportarPDF()"
      class="px-5 py-2.5 bg-[#4B1623] text-white rounded-lg hover:opacity-90 transition font-medium"
       >
        Exportar PDF
    </button>


  <!-- Exportar Excel -->

  <button
    type="button"
    (click)="exportarExcel()"
    class="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
  >
    Exportar Excel
  </button>

</div>


      <!-- =========================================
           ESTADO DE CARGA
           ========================================= -->

      <div
        *ngIf="cargando"
        class="bg-white p-6 rounded-lg shadow mb-8 text-center"
      >

        <p class="text-gray-500">
          Cargando estadísticas...
        </p>

      </div>


      <!-- =========================================
           ERROR
           ========================================= -->

      <div
        *ngIf="error && !cargando"
        class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8"
      >

        {{ error }}

      </div>


      <!-- =========================================
           CONTENIDO
           ========================================= -->

      <div
        *ngIf="estadisticas && !cargando"
        class="space-y-6"
      >


        <!-- =======================================
             TARJETAS PRINCIPALES
             ======================================= -->

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
        >

          <!-- Expedientes -->

          <div
            class="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-[#4B1623]"
          >

            <h3
              class="text-gray-500 text-sm font-semibold uppercase tracking-wider"
            >
              Expedientes
            </h3>

            <p
              class="text-3xl font-bold text-gray-800 mt-2"
            >
              {{ estadisticas.totalExpedientes }}
            </p>

          </div>


          <!-- Documentos -->

          <div
            class="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-green-600"
          >

            <h3
              class="text-gray-500 text-sm font-semibold uppercase tracking-wider"
            >
              Documentos
            </h3>

            <p
              class="text-3xl font-bold text-gray-800 mt-2"
            >
              {{ estadisticas.totalDocumentos }}
            </p>

          </div>


          <!-- Tipos de cita -->

          <div
            class="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-blue-600"
          >

            <h3
              class="text-gray-500 text-sm font-semibold uppercase tracking-wider"
            >
              Tipos de cita
            </h3>

            <p
              class="text-3xl font-bold text-gray-800 mt-2"
            >
              {{ estadisticas.citasPorTipo.length }}
            </p>

          </div>

        </div>



        <!-- =======================================
             PRIMERA FILA
             ======================================= -->

        <div
          class="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >


          <!-- =====================================
               EXPEDIENTES POR ESTADO
               ===================================== -->

          <div
            class="bg-white p-6 rounded-lg shadow border border-gray-200"
          >

            <h2
              class="text-xl font-semibold text-gray-800"
            >
              Expedientes por estado
            </h2>

            <p class="text-sm text-gray-500 mt-1">
              Distribución de los expedientes registrados
            </p>


            <!-- Gráfico -->

            <div
              class="mt-6 w-full"
            >

              <div
                class="h-56 border-b border-gray-200 flex items-end justify-center"
              >

                <div
                  class="flex items-end justify-center gap-10 h-full"
                >

                  <div
                    *ngFor="
                      let item of estadisticas.expedientesPorEstado
                    "
                    class="h-full flex flex-col justify-end items-center"
                  >

                    <span
                      class="text-sm font-bold text-[#4B1623] mb-2"
                    >
                      {{ item._count.id_expediente }}
                    </span>


                    <div
                      class="w-14 bg-[#4B1623] rounded-t-md transition-all duration-500"
                      [style.height.%]="
                        calcularAltura(
                          item._count.id_expediente,
                          obtenerMaximoEstado()
                        )
                      "
                    >
                    </div>

                  </div>

                </div>

              </div>


              <!-- Etiquetas -->

              <div
                class="flex justify-center gap-10 mt-2"
              >

                <div
                  *ngFor="
                    let item of estadisticas.expedientesPorEstado
                  "
                  class="w-14 text-center text-xs text-gray-600 break-words"
                >

                  {{ item.estado }}

                </div>

              </div>

            </div>

          </div>



          <!-- =====================================
               EXPEDIENTES POR MATERIA
               ===================================== -->

          <div
            class="bg-white p-6 rounded-lg shadow border border-gray-200"
          >

            <h2
              class="text-xl font-semibold text-gray-800"
            >
              Expedientes por materia
            </h2>

            <p class="text-sm text-gray-500 mt-1">
              Cantidad de expedientes según su materia jurídica
            </p>


            <!-- Gráfico -->

            <div
              class="mt-6 w-full"
            >

              <div
                class="h-56 border-b border-gray-200 flex items-end justify-center"
              >

                <div
                  class="flex items-end justify-center gap-10 h-full"
                >

                  <div
                    *ngFor="
                      let item of estadisticas.expedientesPorMateria
                    "
                    class="h-full flex flex-col justify-end items-center"
                  >

                    <span
                      class="text-sm font-bold text-[#4B1623] mb-2"
                    >
                      {{ item._count.id_expediente }}
                    </span>


                    <div
                      class="w-14 bg-[#4B1623] rounded-t-md transition-all duration-500"
                      [style.height.%]="
                        calcularAltura(
                          item._count.id_expediente,
                          obtenerMaximoMateria()
                        )
                      "
                    >
                    </div>

                  </div>

                </div>

              </div>


              <!-- Etiquetas -->

              <div
                class="flex justify-center gap-10 mt-2"
              >

                <div
                  *ngFor="
                    let item of estadisticas.expedientesPorMateria
                  "
                  class="w-14 text-center text-xs text-gray-600 break-words"
                >

                  {{ item.materia }}

                </div>

              </div>

            </div>

          </div>

        </div>



        <!-- =======================================
             SEGUNDA FILA
             ======================================= -->

        <div
          class="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >


          <!-- =====================================
               CITAS POR TIPO
               ===================================== -->

          <div
            class="bg-white p-6 rounded-lg shadow border border-gray-200"
          >

            <h2
              class="text-xl font-semibold text-gray-800"
            >
              Citas por tipo
            </h2>

            <p class="text-sm text-gray-500 mt-1">
              Distribución de las citas registradas
            </p>


            <!-- Gráfico -->

            <div
              class="mt-6 w-full"
            >

              <div
                class="h-56 border-b border-gray-200 flex items-end justify-center"
              >

                <div
                  class="flex items-end justify-center gap-10 h-full"
                >

                  <div
                    *ngFor="
                      let item of estadisticas.citasPorTipo
                    "
                    class="h-full flex flex-col justify-end items-center"
                  >

                    <!-- Valor -->

                    <span
                      class="text-sm font-bold mb-2"
                      [style.color]="
                        obtenerColorCita(item.tipo_cita)
                      "
                    >
                      {{ item._count.id_cita }}
                    </span>


                    <!-- Barra -->

                    <div
                      class="w-16 rounded-t-md transition-all duration-500"
                      [style.background-color]="
                        obtenerColorCita(item.tipo_cita)
                      "
                      [style.height.%]="
                        calcularAltura(
                          item._count.id_cita,
                          obtenerMaximoCitas()
                        )
                      "
                    >
                    </div>

                  </div>

                </div>

              </div>


              <!-- Etiquetas -->

              <div
                class="flex justify-center gap-10 mt-2"
              >

                <div
                  *ngFor="
                    let item of estadisticas.citasPorTipo
                  "
                  class="w-16 text-center text-xs break-words"
                  [style.color]="
                    obtenerColorCita(item.tipo_cita)
                  "
                >

                  {{ item.tipo_cita }}

                </div>

              </div>

            </div>


            <!-- Leyenda -->

            <div
              class="flex flex-wrap justify-center gap-6 mt-5 pt-4 border-t border-gray-100"
            >

              <div class="flex items-center gap-2 text-sm">

                <span
                  class="w-3 h-3 rounded-full bg-green-600"
                ></span>

                <span class="text-gray-600">
                  Audiencia
                </span>

              </div>


              <div class="flex items-center gap-2 text-sm">

                <span
                  class="w-3 h-3 rounded-full bg-blue-600"
                ></span>

                <span class="text-gray-600">
                  Reunión
                </span>

              </div>


              <div class="flex items-center gap-2 text-sm">

                <span
                  class="w-3 h-3 rounded-full bg-orange-500"
                ></span>

                <span class="text-gray-600">
                  Trámite
                </span>

              </div>

            </div>

          </div>



          <!-- =====================================
               USUARIOS POR ROL
               ===================================== -->

          <div
            class="bg-white p-6 rounded-lg shadow border border-gray-200"
          >

            <h2
              class="text-xl font-semibold text-gray-800"
            >
              Usuarios por rol
            </h2>

            <p class="text-sm text-gray-500 mt-1">
              Distribución de usuarios según el rol asignado
            </p>


            <!-- =================================
                 CONTENEDOR DEL GRÁFICO
                 ================================= -->

            <div
              class="mt-6 w-full flex flex-col items-center"
            >

              <!--
                Este contenedor limita el ancho del gráfico
                y lo centra dentro de la tarjeta.
              -->

              <div
                class="w-full max-w-md"
              >

                <!-- =================================
                     BARRAS
                     ================================= -->

                <div
                  class="h-56 border-b border-gray-200 flex items-end justify-center"
                >

                  <div
                    class="grid grid-cols-4 items-end justify-items-center w-full h-full px-2"
                  >

                    <div
                      *ngFor="
                        let item of estadisticas.usuariosPorRol
                      "
                      class="h-full flex flex-col justify-end items-center w-full"
                    >

                      <!-- Valor -->

                      <span
                        class="text-sm font-bold text-green-600 mb-2"
                      >
                        {{ item._count.id_usuario }}
                      </span>


                      <!-- Barra -->

                      <div
                        class="w-14 bg-green-600 rounded-t-md transition-all duration-500"
                        [style.height.%]="
                          calcularAltura(
                            item._count.id_usuario,
                            obtenerMaximoUsuarios()
                          )
                        "
                      >
                      </div>

                    </div>

                  </div>

                </div>


                <!-- =================================
                     ETIQUETAS
                     ================================= -->

                <div
                  class="grid grid-cols-4 justify-items-center mt-2 px-2"
                >

                  <div
                    *ngFor="
                      let item of estadisticas.usuariosPorRol
                    "
                    class="w-full text-center text-xs text-gray-600 px-1 whitespace-normal"
                  >

                    {{ item.rol }}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>



        <!-- =======================================
             RESUMEN DEL SISTEMA
             ======================================= -->

        <div
          class="bg-white p-6 rounded-lg shadow border border-gray-200"
        >

          <h2
            class="text-xl font-semibold text-gray-800 mb-5"
          >
            Resumen del sistema
          </h2>


          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-4"
          >

            <!-- Expedientes -->

            <div
              class="p-4 bg-gray-50 rounded-lg"
            >

              <p class="text-sm text-gray-500">
                Total de expedientes
              </p>

              <p
                class="text-2xl font-bold text-[#4B1623]"
              >
                {{ estadisticas.totalExpedientes }}
              </p>

            </div>


            <!-- Documentos -->

            <div
              class="p-4 bg-gray-50 rounded-lg"
            >

              <p class="text-sm text-gray-500">
                Total de documentos
              </p>

              <p
                class="text-2xl font-bold text-green-600"
              >
                {{ estadisticas.totalDocumentos }}
              </p>

            </div>


            <!-- Usuarios -->

            <div
              class="p-4 bg-gray-50 rounded-lg"
            >

              <p class="text-sm text-gray-500">
                Total de usuarios
              </p>

              <p
                class="text-2xl font-bold text-blue-600"
              >
                {{ obtenerTotalUsuarios() }}
              </p>

            </div>

          </div>

        </div>


      </div>

    </div>

  `

})


export class ReportesComponent implements OnInit {


  // ─────────────────────────────────────────────
  // Variables del componente
  // ─────────────────────────────────────────────

  estadisticas: EstadisticasReportes | null = null;

  cargando = true;

  error = '';


  // ─────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────

  constructor(
    private reporteService: ReporteService,
    private cdr: ChangeDetectorRef
  ) {}


  // ─────────────────────────────────────────────
  // Inicialización del componente
  // ─────────────────────────────────────────────

  ngOnInit(): void {

    this.cargarEstadisticas();

  }


  // ─────────────────────────────────────────────
  // Obtener estadísticas
  // ─────────────────────────────────────────────

  cargarEstadisticas(): void {

    this.cargando = true;

    this.error = '';


    this.reporteService
      .obtenerEstadisticas()
      .subscribe({

        next: (datos) => {

          console.log(
            'ESTADÍSTICAS RECIBIDAS EN ANGULAR:',
            datos
          );

          this.estadisticas = datos;

          this.cargando = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'ERROR AL OBTENER ESTADÍSTICAS:',
            error
          );

          this.error =
            'No se pudieron cargar las estadísticas.';

          this.cargando = false;

          this.cdr.detectChanges();

        }

      });

  }


  // ─────────────────────────────────────────────
  // Máximo de expedientes por estado
  // ─────────────────────────────────────────────

  obtenerMaximoEstado(): number {

    if (
      !this.estadisticas ||
      this.estadisticas.expedientesPorEstado.length === 0
    ) {

      return 1;

    }

    return Math.max(
      ...this.estadisticas.expedientesPorEstado.map(
        item => item._count.id_expediente ?? 0
      )
    ) || 1;

  }


  // ─────────────────────────────────────────────
  // Máximo de expedientes por materia
  // ─────────────────────────────────────────────

  obtenerMaximoMateria(): number {

    if (
      !this.estadisticas ||
      this.estadisticas.expedientesPorMateria.length === 0
    ) {

      return 1;

    }

    return Math.max(
      ...this.estadisticas.expedientesPorMateria.map(
        item => item._count.id_expediente ?? 0
      )
    ) || 1;

  }


  // ─────────────────────────────────────────────
  // Máximo de citas
  // ─────────────────────────────────────────────

  obtenerMaximoCitas(): number {

    if (
      !this.estadisticas ||
      this.estadisticas.citasPorTipo.length === 0
    ) {

      return 1;

    }

    return Math.max(
      ...this.estadisticas.citasPorTipo.map(
        item => item._count.id_cita ?? 0
      )
    ) || 1;

  }


  // ─────────────────────────────────────────────
  // Máximo de usuarios
  // ─────────────────────────────────────────────

  obtenerMaximoUsuarios(): number {

    if (
      !this.estadisticas ||
      this.estadisticas.usuariosPorRol.length === 0
    ) {

      return 1;

    }

    return Math.max(
      ...this.estadisticas.usuariosPorRol.map(
        item => item._count.id_usuario ?? 0
      )
    ) || 1;

  }


  // ─────────────────────────────────────────────
  // Calcular altura de las barras
  // ─────────────────────────────────────────────

  calcularAltura(
    valor: number | undefined,
    maximo: number
  ): number {

    if (!valor || maximo <= 0) {

      return 0;

    }

    return (valor / maximo) * 100;

  }


  // ─────────────────────────────────────────────
  // Colores de las citas
  //
  // Se mantienen los colores utilizados
  // en el calendario.
  // ─────────────────────────────────────────────

  obtenerColorCita(tipo?: string): string {

    if (!tipo) {

      return '#4B1623';

    }


    switch (tipo.toLowerCase()) {

      // Audiencia → verde

      case 'audiencia':

        return '#16A34A';


      // Reunión → azul

      case 'reunión':
      case 'reunion':

        return '#2563EB';


      // Trámite → naranja

      case 'trámite':
      case 'tramite':

        return '#F59E0B';


      // Color por defecto

      default:

        return '#4B1623';

    }

  }


  // ─────────────────────────────────────────────
  // Total de usuarios
  // ─────────────────────────────────────────────

  obtenerTotalUsuarios(): number {

    if (!this.estadisticas) {

      return 0;

    }


    return this.estadisticas.usuariosPorRol.reduce(
      (total, item) =>
        total + (item._count.id_usuario ?? 0),
      0
    );

  }

  // ─────────────────────────────────────────────
// Exportar estadísticas a Excel
// Genera un reporte general del sistema SGEJ
// con formato, colores y diferentes hojas.
// ─────────────────────────────────────────────

exportarExcel(): void {

  // Verificamos que existan estadísticas antes de exportar

  if (!this.estadisticas) {

    console.error(
      'No existen estadísticas para exportar.'
    );

    return;

  }


  // ─────────────────────────────────────────────
  // Colores institucionales
  // ─────────────────────────────────────────────

  const COLOR_VINO = '4B1623';

  const COLOR_CREMA = 'F3F2EE';

  const COLOR_BLANCO = 'FFFFFF';

  const COLOR_VERDE = '16A34A';

  const COLOR_AZUL = '2563EB';

  const COLOR_NARANJA = 'F59E0B';

  const COLOR_GRIS = '666666';

  const COLOR_BORDE = 'D9D9D9';



  // ─────────────────────────────────────────────
  // Estilo para títulos principales
  // ─────────────────────────────────────────────

  const estiloTitulo: any = {

    font: {
      name: 'Calibri',
      sz: 18,
      bold: true,
      color: {
        rgb: COLOR_BLANCO
      }
    },

    fill: {
      fgColor: {
        rgb: COLOR_VINO
      }
    },

    alignment: {
      horizontal: 'center',
      vertical: 'center'
    }

  };



  // ─────────────────────────────────────────────
  // Estilo para subtítulos
  // ─────────────────────────────────────────────

  const estiloSubtitulo: any = {

    font: {
      name: 'Calibri',
      sz: 11,
      italic: true,
      color: {
        rgb: COLOR_GRIS
      }
    },

    alignment: {
      horizontal: 'center',
      vertical: 'center'
    }

  };



  // ─────────────────────────────────────────────
  // Estilo para encabezados de tablas
  // ─────────────────────────────────────────────

  const estiloEncabezado: any = {

    font: {
      name: 'Calibri',
      sz: 11,
      bold: true,
      color: {
        rgb: COLOR_BLANCO
      }
    },

    fill: {
      fgColor: {
        rgb: COLOR_VINO
      }
    },

    alignment: {
      horizontal: 'center',
      vertical: 'center',
      wrapText: true
    },

    border: {

      top: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      bottom: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      left: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      right: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      }

    }

  };



  // ─────────────────────────────────────────────
  // Estilo para datos normales
  // ─────────────────────────────────────────────

  const estiloDato: any = {

    font: {
      name: 'Calibri',
      sz: 11,
      color: {
        rgb: '333333'
      }
    },

    alignment: {
      vertical: 'center'
    },

    border: {

      top: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      bottom: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      left: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      right: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      }

    }

  };



  // ─────────────────────────────────────────────
  // Estilo para cantidades
  // ─────────────────────────────────────────────

  const estiloCantidad: any = {

    font: {
      name: 'Calibri',
      sz: 11,
      bold: true,
      color: {
        rgb: COLOR_VINO
      }
    },

    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },

    border: {

      top: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      bottom: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      left: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      },

      right: {
        style: 'thin',
        color: {
          rgb: COLOR_BORDE
        }
      }

    }

  };



  // ─────────────────────────────────────────────
  // Crear libro de Excel
  // ─────────────────────────────────────────────

  const libro = XLSX.utils.book_new();



  // =====================================================
  // HOJA 1 — RESUMEN
  // =====================================================

  const totalCitas =
    this.estadisticas.citasPorTipo.reduce(
      (
        total: number,
        item: any
      ) => {

        return total +
          Number(
            item._count?.id_cita || 0
          );

      },

      0
    );


  const totalUsuarios =
    this.estadisticas.usuariosPorRol.reduce(
      (
        total: number,
        item: any
      ) => {

        return total +
          Number(
            item._count?.id_usuario || 0
          );

      },

      0
    );


  const datosResumen: any[][] = [

    [
      'JUSTICE ATTORNEY LAW',
      ''
    ],

    [
      'REPORTE GENERAL DEL SISTEMA SGEJ',
      ''
    ],

    [
      'Sistema de Gestión de Expedientes Jurídicos',
      ''
    ],

    [],

    [
      'RESUMEN GENERAL',
      ''
    ],

    [],

    [
      'Total de expedientes',
      this.estadisticas.totalExpedientes
    ],

    [
      'Total de documentos',
      this.estadisticas.totalDocumentos
    ],

    [
      'Total de citas',
      totalCitas
    ],

    [
      'Tipos de cita',
      this.estadisticas.citasPorTipo.length
    ],

    [
      'Total de usuarios',
      totalUsuarios
    ],

    [],

    [
      'EXPEDIENTES POR ESTADO',
      ''
    ],

    [
      'Estado',
      'Cantidad'
    ]

  ];



  // Agregar expedientes por estado

  this.estadisticas.expedientesPorEstado
    .forEach(
      (item: any) => {

        datosResumen.push([

          item.estado,

          Number(
            item._count?.id_expediente || 0
          )

        ]);

      }
    );



  // ─────────────────────────────────────────────
  // Expedientes por materia
  // ─────────────────────────────────────────────

  datosResumen.push([]);

  datosResumen.push([
    'EXPEDIENTES POR MATERIA',
    ''
  ]);

  datosResumen.push([
    'Materia',
    'Cantidad'
  ]);


  this.estadisticas.expedientesPorMateria
    .forEach(
      (item: any) => {

        datosResumen.push([

          item.materia,

          Number(
            item._count?.id_expediente || 0
          )

        ]);

      }
    );



  // ─────────────────────────────────────────────
  // Citas por tipo
  // ─────────────────────────────────────────────

  datosResumen.push([]);

  datosResumen.push([
    'CITAS POR TIPO',
    ''
  ]);

  datosResumen.push([
    'Tipo de cita',
    'Cantidad'
  ]);


  this.estadisticas.citasPorTipo
    .forEach(
      (item: any) => {

        datosResumen.push([

          item.tipo_cita,

          Number(
            item._count?.id_cita || 0
          )

        ]);

      }
    );



  // ─────────────────────────────────────────────
  // Usuarios por rol
  // ─────────────────────────────────────────────

  datosResumen.push([]);

  datosResumen.push([
    'USUARIOS POR ROL',
    ''
  ]);

  datosResumen.push([
    'Rol',
    'Cantidad'
  ]);


  this.estadisticas.usuariosPorRol
    .forEach(
      (item: any) => {

        datosResumen.push([

          item.rol,

          Number(
            item._count?.id_usuario || 0
          )

        ]);

      }
    );



  // Crear hoja

  const hojaResumen =
    XLSX.utils.aoa_to_sheet(
      datosResumen
    );



  // ─────────────────────────────────────────────
  // Combinar títulos
  // ─────────────────────────────────────────────

  hojaResumen['!merges'] = [

    {
      s: {
        r: 0,
        c: 0
      },

      e: {
        r: 0,
        c: 1
      }
    },

    {
      s: {
        r: 1,
        c: 0
      },

      e: {
        r: 1,
        c: 1
      }
    },

    {
      s: {
        r: 2,
        c: 0
      },

      e: {
        r: 2,
        c: 1
      }
    }

  ];



  // ─────────────────────────────────────────────
  // Aplicar estilos a los títulos
  // ─────────────────────────────────────────────

  hojaResumen['A1'].s =
    estiloTitulo;

  hojaResumen['A2'].s =
    estiloTitulo;

  hojaResumen['A2'].s.font.sz =
    14;

  hojaResumen['A3'].s =
    estiloSubtitulo;



  // ─────────────────────────────────────────────
  // Estilo de las secciones
  // ─────────────────────────────────────────────

  const filasSeccion: number[] = [];


  for (
    let i = 0;
    i < datosResumen.length;
    i++
  ) {

    const valor =
      datosResumen[i][0];


    if (
      valor === 'RESUMEN GENERAL' ||
      valor === 'EXPEDIENTES POR ESTADO' ||
      valor === 'EXPEDIENTES POR MATERIA' ||
      valor === 'CITAS POR TIPO' ||
      valor === 'USUARIOS POR ROL'
    ) {

      filasSeccion.push(i + 1);

    }

  }



  filasSeccion.forEach(
    (fila: number) => {

      hojaResumen[`A${fila}`].s = {

        ...estiloTitulo,

        font: {

          name: 'Calibri',
          sz: 12,
          bold: true,
          color: {
            rgb: COLOR_BLANCO
          }

        }

      };

    }
  );



  // ─────────────────────────────────────────────
  // Estilos para las tablas
  // ─────────────────────────────────────────────

  for (
    let fila = 1;
    fila <= datosResumen.length;
    fila++
  ) {

    const celdaA =
      hojaResumen[`A${fila}`];

    const celdaB =
      hojaResumen[`B${fila}`];


    if (
      !celdaA ||
      !celdaB
    ) {

      continue;

    }


    // Saltamos títulos y tarjetas

    if (
      fila <= 3 ||
      fila === 7 ||
      fila === 8 ||
      fila === 9 ||
      fila === 10 ||
      fila === 11
    ) {

      continue;

    }


    // Encabezados de tablas

    if (
      celdaA.v === 'Estado' ||
      celdaA.v === 'Materia' ||
      celdaA.v === 'Tipo de cita' ||
      celdaA.v === 'Rol'
    ) {

      celdaA.s =
        estiloEncabezado;

      celdaB.s =
        estiloEncabezado;

      continue;

    }


    // Datos normales

    if (
      typeof celdaA.v === 'string'
    ) {

      celdaA.s =
        estiloDato;

    }


    if (
      typeof celdaB.v === 'number'
    ) {

      celdaB.s =
        estiloCantidad;

    }

  }



  // ─────────────────────────────────────────────
  // Estilo especial para tarjetas principales
  // ─────────────────────────────────────────────

  hojaResumen['B7'].s = {

    ...estiloCantidad,

    font: {

      name: 'Calibri',
      sz: 16,
      bold: true,
      color: {
        rgb: COLOR_VINO
      }

    },

    fill: {

      fgColor: {
        rgb: COLOR_CREMA
      }

    }

  };


  hojaResumen['B8'].s = {

    ...estiloCantidad,

    font: {

      name: 'Calibri',
      sz: 16,
      bold: true,
      color: {
        rgb: COLOR_VERDE
      }

    },

    fill: {

      fgColor: {
        rgb: COLOR_CREMA
      }

    }

  };


  hojaResumen['B9'].s = {

    ...estiloCantidad,

    font: {

      name: 'Calibri',
      sz: 16,
      bold: true,
      color: {
        rgb: COLOR_AZUL
      }

    },

    fill: {

      fgColor: {
        rgb: COLOR_CREMA
      }

    }

  };


  hojaResumen['B10'].s = {

    ...estiloCantidad,

    font: {

      name: 'Calibri',
      sz: 16,
      bold: true,
      color: {
        rgb: COLOR_NARANJA
      }

    },

    fill: {

      fgColor: {
        rgb: COLOR_CREMA
      }

    }

  };


  hojaResumen['B11'].s = {

    ...estiloCantidad,

    font: {

      name: 'Calibri',
      sz: 16,
      bold: true,
      color: {
        rgb: COLOR_VINO
      }

    },

    fill: {

      fgColor: {
        rgb: COLOR_CREMA
      }

    }

  };



  // Ancho de columnas

  hojaResumen['!cols'] = [

    {
      wch: 36
    },

    {
      wch: 18
    }

  ];


  // Altura de filas

  hojaResumen['!rows'] = [

    {
      hpt: 32
    },

    {
      hpt: 26
    },

    {
      hpt: 22
    }

  ];


  // Congelar encabezados

  hojaResumen['!freeze'] = {

    xSplit: 0,

    ySplit: 5

  };


  XLSX.utils.book_append_sheet(

    libro,

    hojaResumen,

    'Resumen'

  );



  // =====================================================
  // HOJA 2 — EXPEDIENTES POR ESTADO
  // =====================================================

  const datosEstado: any[][] = [

    [
      'EXPEDIENTES POR ESTADO',
      ''
    ],

    [
      'Estado',
      'Cantidad'
    ]

  ];


  this.estadisticas.expedientesPorEstado
    .forEach(
      (item: any) => {

        datosEstado.push([

          item.estado,

          Number(
            item._count?.id_expediente || 0
          )

        ]);

      }
    );


  const hojaEstado =
    XLSX.utils.aoa_to_sheet(
      datosEstado
    );


  hojaEstado['!merges'] = [

    {
      s: {
        r: 0,
        c: 0
      },

      e: {
        r: 0,
        c: 1
      }
    }

  ];


  hojaEstado['A1'].s =
    estiloTitulo;

  hojaEstado['A2'].s =
    estiloEncabezado;

  hojaEstado['B2'].s =
    estiloEncabezado;


  for (
    let fila = 3;
    fila <= datosEstado.length;
    fila++
  ) {

    hojaEstado[`A${fila}`].s =
      estiloDato;

    hojaEstado[`B${fila}`].s =
      estiloCantidad;

  }


  hojaEstado['!cols'] = [

    {
      wch: 30
    },

    {
      wch: 18
    }

  ];


  hojaEstado['!freeze'] = {

    xSplit: 0,

    ySplit: 2

  };


  XLSX.utils.book_append_sheet(

    libro,

    hojaEstado,

    'Expedientes Estado'

  );



  // =====================================================
  // HOJA 3 — EXPEDIENTES POR MATERIA
  // =====================================================

  const datosMateria: any[][] = [

    [
      'EXPEDIENTES POR MATERIA',
      ''
    ],

    [
      'Materia',
      'Cantidad'
    ]

  ];


  this.estadisticas.expedientesPorMateria
    .forEach(
      (item: any) => {

        datosMateria.push([

          item.materia,

          Number(
            item._count?.id_expediente || 0
          )

        ]);

      }
    );


  const hojaMateria =
    XLSX.utils.aoa_to_sheet(
      datosMateria
    );


  hojaMateria['!merges'] = [

    {
      s: {
        r: 0,
        c: 0
      },

      e: {
        r: 0,
        c: 1
      }
    }

  ];


  hojaMateria['A1'].s =
    estiloTitulo;

  hojaMateria['A2'].s =
    estiloEncabezado;

  hojaMateria['B2'].s =
    estiloEncabezado;


  for (
    let fila = 3;
    fila <= datosMateria.length;
    fila++
  ) {

    hojaMateria[`A${fila}`].s =
      estiloDato;

    hojaMateria[`B${fila}`].s =
      estiloCantidad;

  }


  hojaMateria['!cols'] = [

    {
      wch: 30
    },

    {
      wch: 18
    }

  ];


  hojaMateria['!freeze'] = {

    xSplit: 0,

    ySplit: 2

  };


  XLSX.utils.book_append_sheet(

    libro,

    hojaMateria,

    'Expedientes Materia'

  );



  // =====================================================
  // HOJA 4 — CITAS
  // =====================================================

  const datosCitas: any[][] = [

    [
      'CITAS POR TIPO',
      ''
    ],

    [
      'Tipo de cita',
      'Cantidad'
    ]

  ];


  this.estadisticas.citasPorTipo
    .forEach(
      (item: any) => {

        datosCitas.push([

          item.tipo_cita,

          Number(
            item._count?.id_cita || 0
          )

        ]);

      }
    );


  const hojaCitas =
    XLSX.utils.aoa_to_sheet(
      datosCitas
    );


  hojaCitas['!merges'] = [

    {
      s: {
        r: 0,
        c: 0
      },

      e: {
        r: 0,
        c: 1
      }
    }

  ];


  hojaCitas['A1'].s =
    estiloTitulo;

  hojaCitas['A2'].s =
    estiloEncabezado;

  hojaCitas['B2'].s =
    estiloEncabezado;


  for (
    let fila = 3;
    fila <= datosCitas.length;
    fila++
  ) {

    const celda =
      hojaCitas[`A${fila}`];


    let color =
      COLOR_VINO;


    if (
      celda &&
      typeof celda.v === 'string'
    ) {

      const tipo =
        celda.v.toLowerCase();


      if (
        tipo === 'audiencia'
      ) {

        color =
          COLOR_VERDE;

      }


      if (
        tipo === 'reunión' ||
        tipo === 'reunion'
      ) {

        color =
          COLOR_AZUL;

      }


      if (
        tipo === 'trámite' ||
        tipo === 'tramite'
      ) {

        color =
          COLOR_NARANJA;

      }

    }


    hojaCitas[`A${fila}`].s = {

      ...estiloDato,

      font: {

        name: 'Calibri',

        sz: 11,

        bold: true,

        color: {
          rgb: color
        }

      }

    };


    hojaCitas[`B${fila}`].s =
      estiloCantidad;

  }


  hojaCitas['!cols'] = [

    {
      wch: 30
    },

    {
      wch: 18
    }

  ];


  hojaCitas['!freeze'] = {

    xSplit: 0,

    ySplit: 2

  };


  XLSX.utils.book_append_sheet(

    libro,

    hojaCitas,

    'Citas'

  );



  // =====================================================
  // HOJA 5 — USUARIOS
  // =====================================================

  const datosUsuarios: any[][] = [

    [
      'USUARIOS POR ROL',
      ''
    ],

    [
      'Rol',
      'Cantidad'
    ]

  ];


  this.estadisticas.usuariosPorRol
    .forEach(
      (item: any) => {

        datosUsuarios.push([

          item.rol,

          Number(
            item._count?.id_usuario || 0
          )

        ]);

      }
    );


  const hojaUsuarios =
    XLSX.utils.aoa_to_sheet(
      datosUsuarios
    );


  hojaUsuarios['!merges'] = [

    {
      s: {
        r: 0,
        c: 0
      },

      e: {
        r: 0,
        c: 1
      }
    }

  ];


  hojaUsuarios['A1'].s =
    estiloTitulo;

  hojaUsuarios['A2'].s =
    estiloEncabezado;

  hojaUsuarios['B2'].s =
    estiloEncabezado;


  for (
    let fila = 3;
    fila <= datosUsuarios.length;
    fila++
  ) {

    hojaUsuarios[`A${fila}`].s =
      estiloDato;

    hojaUsuarios[`B${fila}`].s =
      estiloCantidad;

  }


  hojaUsuarios['!cols'] = [

    {
      wch: 30
    },

    {
      wch: 18
    }

  ];


  hojaUsuarios['!freeze'] = {

    xSplit: 0,

    ySplit: 2

  };


  XLSX.utils.book_append_sheet(

    libro,

    hojaUsuarios,

    'Usuarios'

  );



  // =====================================================
  // GENERAR ARCHIVO
  // =====================================================

  XLSX.writeFile(

    libro,

    'reporte-general-SGEJ.xlsx'

  );


  console.log(
    'Excel generado correctamente.'
  );

}


// ─────────────────────────────────────────────
// Exportar estadísticas a PDF
// ─────────────────────────────────────────────

exportarPDF(): void {

  // Verificar que existan estadísticas

  if (!this.estadisticas) {

    return;

  }


  // Crear documento PDF

  const pdf = new jsPDF();


  // =========================================
  // ENCABEZADO
  // =========================================

  pdf.setFontSize(20);

  pdf.setTextColor(75, 22, 35);

  pdf.text(
    'JUSTICE ATTORNEY LAW',
    20,
    20
  );


  pdf.setFontSize(16);

  pdf.setTextColor(40, 40, 40);

  pdf.text(
    'Reportes y Estadísticas',
    20,
    32
  );


  pdf.setFontSize(10);

  pdf.setTextColor(100, 100, 100);

  pdf.text(
    'Resumen general de la información del sistema',
    20,
    40
  );


  // =========================================
  // RESUMEN GENERAL
  // =========================================

  pdf.setFontSize(13);

  pdf.setTextColor(75, 22, 35);

  pdf.text(
    'Resumen general',
    20,
    55
  );


  pdf.setFontSize(11);

  pdf.setTextColor(50, 50, 50);

  pdf.text(
    `Total de expedientes: ${this.estadisticas.totalExpedientes}`,
    25,
    65
  );

  pdf.text(
    `Total de documentos: ${this.estadisticas.totalDocumentos}`,
    25,
    73
  );

  pdf.text(
    `Tipos de cita: ${this.estadisticas.citasPorTipo.length}`,
    25,
    81
  );


  // =========================================
  // EXPEDIENTES POR ESTADO
  // =========================================

  pdf.setFontSize(13);

  pdf.setTextColor(75, 22, 35);

  pdf.text(
    'Expedientes por estado',
    20,
    98
  );


  let posicionY = 108;


  this.estadisticas.expedientesPorEstado
    .forEach(item => {

      pdf.setFontSize(10);

      pdf.setTextColor(50, 50, 50);

      pdf.text(
        `${item.estado}: ${item._count.id_expediente}`,
        25,
        posicionY
      );

      posicionY += 8;

    });


  // =========================================
  // EXPEDIENTES POR MATERIA
  // =========================================

  posicionY += 8;

  pdf.setFontSize(13);

  pdf.setTextColor(75, 22, 35);

  pdf.text(
    'Expedientes por materia',
    20,
    posicionY
  );


  posicionY += 10;


  this.estadisticas.expedientesPorMateria
    .forEach(item => {

      pdf.setFontSize(10);

      pdf.setTextColor(50, 50, 50);

      pdf.text(
        `${item.materia}: ${item._count.id_expediente}`,
        25,
        posicionY
      );

      posicionY += 8;

    });


  // =========================================
  // CITAS POR TIPO
  // =========================================

  posicionY += 8;

  pdf.setFontSize(13);

  pdf.setTextColor(75, 22, 35);

  pdf.text(
    'Citas por tipo',
    20,
    posicionY
  );


  posicionY += 10;


  this.estadisticas.citasPorTipo
    .forEach(item => {

      pdf.setFontSize(10);

      pdf.setTextColor(50, 50, 50);

      pdf.text(
        `${item.tipo_cita}: ${item._count.id_cita}`,
        25,
        posicionY
      );

      posicionY += 8;

    });


  // =========================================
  // USUARIOS POR ROL
  // =========================================

  posicionY += 8;


  // Si estamos muy abajo, crear nueva página

  if (posicionY > 250) {

    pdf.addPage();

    posicionY = 20;

  }


  pdf.setFontSize(13);

  pdf.setTextColor(75, 22, 35);

  pdf.text(
    'Usuarios por rol',
    20,
    posicionY
  );


  posicionY += 10;


  this.estadisticas.usuariosPorRol
    .forEach(item => {

      pdf.setFontSize(10);

      pdf.setTextColor(50, 50, 50);

      pdf.text(
        `${item.rol}: ${item._count.id_usuario}`,
        25,
        posicionY
      );

      posicionY += 8;

    });


  // =========================================
  // PIE DEL DOCUMENTO
  // =========================================

  pdf.setFontSize(9);

  pdf.setTextColor(120, 120, 120);

  pdf.text(
    'Sistema de Gestión de Expedientes Jurídicos - SGEJ',
    20,
    285
  );


  // =========================================
  // DESCARGAR PDF
  // =========================================

  pdf.save(
    'reporte-general-SGEJ.pdf'
  );

}

}