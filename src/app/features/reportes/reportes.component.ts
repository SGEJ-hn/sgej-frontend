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
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],

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