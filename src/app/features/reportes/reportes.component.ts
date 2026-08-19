import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { SharedHeader } from '../../shared/components/shared-header/shared-header';
import { ReporteService, EstadisticasReportes } from '../../core/services/reporte.service';
import {AuthService} from '../../core/services/auth.service'
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx-js-style';
import { 
  heroDocumentChartBar, 
  heroArrowDownTray, 
  heroFolder, 
  heroUsers,
  heroDocumentText
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, NgIconComponent, SharedHeader],
  viewProviders: [provideIcons({ heroDocumentChartBar, heroArrowDownTray, heroFolder, heroUsers, heroDocumentText })],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
  
  estadisticas: EstadisticasReportes | null = null;
  cargando = true;
  error = '';
  rolUsuario = '';
  esAdmin = false;

  constructor(
    private reporteService: ReporteService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuarioActual = this.authService.getUser();
    this.rolUsuario = usuarioActual?.rol || '';
    this.esAdmin = this.rolUsuario === 'ADMIN';
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.error = '';
    this.reporteService.obtenerEstadisticas().subscribe({
      next: (datos) => {
        this.estadisticas = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('ERROR AL OBTENER ESTADÍSTICAS:', error);
        this.error = 'No se pudieron cargar las estadísticas.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─────────────────────────────────────────────
  // Métodos de apoyo para los gráficos
  // ─────────────────────────────────────────────

  private obtenerMaximoGenerico(arreglo: any[] | undefined, propiedad: string): number {
    if (!arreglo || arreglo.length === 0) return 1;
    return Math.max(...arreglo.map(item => item._count?.[propiedad] ?? 0)) || 1;
  }

  obtenerMaximoEstado(): number { return this.obtenerMaximoGenerico(this.estadisticas?.expedientesPorEstado, 'id_expediente'); }
  obtenerMaximoMateria(): number { return this.obtenerMaximoGenerico(this.estadisticas?.expedientesPorMateria, 'id_expediente'); }
  obtenerMaximoCitas(): number { return this.obtenerMaximoGenerico(this.estadisticas?.citasPorTipo, 'id_cita'); }
  obtenerMaximoUsuarios(): number { return this.obtenerMaximoGenerico(this.estadisticas?.usuariosPorRol, 'id_usuario'); }

  calcularAltura(valor: number | undefined, maximo: number): number {
    return (!valor || maximo <= 0) ? 0 : (valor / maximo) * 100;
  }

  obtenerColorCita(tipo?: string): string {
    if (!tipo) return '#4B1623';
    switch (tipo.toLowerCase()) {
      case 'audiencia': return '#16A34A';
      case 'reunión':
      case 'reunion': return '#2563EB';
      case 'trámite':
      case 'tramite': return '#F59E0B';
      default: return '#4B1623';
    }
  }

  obtenerTotalUsuarios(): number {
    if (!this.estadisticas) return 0;
    return this.estadisticas.usuariosPorRol.reduce((total, item) => total + (item._count.id_usuario ?? 0), 0);
  }

  obtenerTotalCitas(): number {
    if (!this.estadisticas) return 0;
    return this.estadisticas.citasPorTipo.reduce((total, item) => total + (item._count.id_cita ?? 0), 0);
  }

// ─────────────────────────────────────────────
  // Exportar estadísticas a Excel (Diseño Profesional)
  // ─────────────────────────────────────────────
  exportarExcel(): void {
    if (!this.estadisticas) {
      console.error('No existen estadísticas para exportar.');
      return;
    }

    const COLORES = {
      VINO: '4A1525', CREMA: 'F8F7F5', BLANCO: 'FFFFFF',
      GRIS_OSCURO: '333333', GRIS_CLARO: 'F3F4F6', BORDE: 'E5E7EB'
    };

    const bordesGenerales = {
      top: { style: 'thin', color: { rgb: COLORES.BORDE } },
      bottom: { style: 'thin', color: { rgb: COLORES.BORDE } },
      left: { style: 'thin', color: { rgb: COLORES.BORDE } },
      right: { style: 'thin', color: { rgb: COLORES.BORDE } }
    };

    const estiloTituloPrincipal = {
      font: { name: 'Arial', sz: 20, bold: true, color: { rgb: COLORES.BLANCO } },
      fill: { fgColor: { rgb: COLORES.VINO } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const estiloMetadatos = {
      font: { name: 'Arial', sz: 10, italic: true, color: { rgb: COLORES.GRIS_OSCURO } },
      alignment: { horizontal: 'right', vertical: 'center' }
    };

    const estiloEncabezadoTabla = {
      font: { name: 'Arial', sz: 11, bold: true, color: { rgb: COLORES.BLANCO } },
      fill: { fgColor: { rgb: '6B2036' } }, // Un vino un poco más claro
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: bordesGenerales
    };

    const estiloDato = {
      font: { name: 'Arial', sz: 11, color: { rgb: COLORES.GRIS_OSCURO } },
      alignment: { vertical: 'center', horizontal: 'left' },
      border: bordesGenerales
    };

    const estiloDatoNumerico = {
      ...estiloDato,
      font: { name: 'Arial', sz: 11, bold: true, color: { rgb: COLORES.VINO } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: COLORES.CREMA } }
    };

    const libro = XLSX.utils.book_new();

    const generarBloqueDatos = (titulo: string, cabecera1: string, datos: any[], keyNombre: string, keyValor: string): any[][] => {
      const bloque: any[][] = [];
      bloque.push([titulo, '']);
      bloque.push([cabecera1, 'Cantidad Registrada']);
      datos.forEach(item => bloque.push([item[keyNombre], Number(item._count?.[keyValor] || 0)]));
      return bloque;
    };

    // =====================================================
    // HOJA 1 — RESUMEN GENERAL
    // =====================================================
    let datosResumen: any[][] = [
      ['JUSTICE ATTORNEY LAW - REPORTE DE GESTIÓN', ''],
      [`Fecha de emisión: ${new Date().toLocaleDateString()}`, ''],
      [`Generado por: ${this.rolUsuario}`, ''],
      [],
      ['MÉTRICAS PRINCIPALES DEL SISTEMA', ''],
      ['Total de expedientes activos', this.estadisticas.totalExpedientes],
      ['Total de documentos procesados', this.estadisticas.totalDocumentos],
      ['Total de citas programadas', this.obtenerTotalCitas()],
      ['Categorías de citas', this.estadisticas.citasPorTipo.length]
    ];

    // Ocultar total de usuarios si NO es admin
    if (this.esAdmin) {
      datosResumen.push(['Total de usuarios registrados', this.obtenerTotalUsuarios()]);
    }

    datosResumen.push([]);

    // Añadir bloques dinámicamente
    datosResumen = datosResumen.concat(
      generarBloqueDatos('DESGLOSE DE EXPEDIENTES POR ESTADO', 'Estado del Caso', this.estadisticas.expedientesPorEstado, 'estado', 'id_expediente'),
      [[]],
      generarBloqueDatos('DESGLOSE DE EXPEDIENTES POR MATERIA', 'Materia Jurídica', this.estadisticas.expedientesPorMateria, 'materia', 'id_expediente'),
      [[]],
      generarBloqueDatos('DESGLOSE DE CITAS POR TIPO', 'Tipo de Actividad', this.estadisticas.citasPorTipo, 'tipo_cita', 'id_cita')
    );

    // Ocultar bloque de usuarios si NO es admin
    if (this.esAdmin) {
      datosResumen = datosResumen.concat(
        [[]],
        generarBloqueDatos('DESGLOSE DE USUARIOS POR ROL', 'Rol en el Sistema', this.estadisticas.usuariosPorRol, 'rol', 'id_usuario')
      );
    }

    const hojaResumen = XLSX.utils.aoa_to_sheet(datosResumen);

    // Fusiones de celdas
    hojaResumen['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Título
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // Fecha
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }  // Autor
    ];

    // Aplicar estilos
    hojaResumen['A1'].s = estiloTituloPrincipal;
    hojaResumen['A2'].s = estiloMetadatos;
    hojaResumen['A3'].s = estiloMetadatos;

    for (let fila = 4; fila <= datosResumen.length; fila++) {
      const celdaA = hojaResumen[`A${fila}`];
      const celdaB = hojaResumen[`B${fila}`];
      
      if (!celdaA) continue;

      if (typeof celdaA.v === 'string' && celdaA.v.includes('MÉTRICAS') || celdaA.v.includes('DESGLOSE')) {
        celdaA.s = { ...estiloTituloPrincipal, font: { ...estiloTituloPrincipal.font, sz: 12 } };
        if(celdaB) celdaB.s = { ...estiloTituloPrincipal, font: { ...estiloTituloPrincipal.font, sz: 12 } };
        // Fusión para subtítulos
        hojaResumen['!merges'].push({ s: { r: fila - 1, c: 0 }, e: { r: fila - 1, c: 1 } });
        continue;
      }

      if (celdaB) {
        if (['Estado del Caso', 'Materia Jurídica', 'Tipo de Actividad', 'Rol en el Sistema'].includes(celdaA.v) || celdaB.v === 'Cantidad Registrada') {
          celdaA.s = estiloEncabezadoTabla;
          celdaB.s = { ...estiloEncabezadoTabla, alignment: { horizontal: 'center' } };
        } else {
          celdaA.s = estiloDato;
          celdaB.s = estiloDatoNumerico;
        }
      }
    }

    hojaResumen['!cols'] = [{ wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(libro, hojaResumen, 'Reporte General');

    XLSX.writeFile(libro, `Reporte_SGEJ_${new Date().getTime()}.xlsx`);
  }

  // ─────────────────────────────────────────────
  // Exportar estadísticas a PDF (Diseño Profesional)
  // ─────────────────────────────────────────────
  exportarPDF(): void {
    if (!this.estadisticas) return;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let posicionY = 0;
    let paginaActual = 1;

    const agregarEncabezado = () => {
      // Franja superior Vino
      pdf.setFillColor(74, 21, 37); // #4a1525
      pdf.rect(0, 0, 210, 35, 'F');
      
      // Texto principal
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text('JUSTICE ATTORNEY LAW', 15, 20);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text('Sistema de Gestión de Expedientes Jurídicos', 15, 27);

      posicionY = 50;
      
      // Título del documento
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(40, 40, 40);
      pdf.text('REPORTE ESTADÍSTICO DE GESTIÓN', 15, posicionY);
      posicionY += 7;

      // Metadatos
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Fecha de emisión: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 15, posicionY);
      pdf.text(`Generado por: ${this.rolUsuario}`, 140, posicionY);
      posicionY += 5;

      // Línea divisoria
      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, posicionY, 195, posicionY);
      posicionY += 15;
    };

    const agregarPiePagina = () => {
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setDrawColor(220, 220, 220);
      pdf.line(15, 285, 195, 285);
      pdf.text(`Documento generado por SGEJ - Confidencial | Página ${paginaActual}`, 15, 290);
    };

    const verificarEspacio = (espacioNecesario: number) => {
      if (posicionY + espacioNecesario > 270) {
        agregarPiePagina();
        pdf.addPage();
        paginaActual++;
        agregarEncabezado();
      }
    };

    const dibujarTabla = (titulo: string, items: any[], keyNombre: string, keyValor: string) => {
      verificarEspacio(30 + (items.length * 8));

      // Título de la sección con fondo
      pdf.setFillColor(243, 244, 246); // Gris muy claro
      pdf.rect(15, posicionY - 6, 180, 10, 'F');
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(74, 21, 37);
      pdf.text(titulo.toUpperCase(), 20, posicionY);
      posicionY += 10;

      // Cabeceras de tabla
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text('DESCRIPCIÓN', 20, posicionY);
      pdf.text('CANTIDAD', 175, posicionY);
      posicionY += 3;
      pdf.setDrawColor(74, 21, 37);
      pdf.setLineWidth(0.5);
      pdf.line(15, posicionY, 195, posicionY);
      posicionY += 6;

      // Filas
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      pdf.setLineWidth(0.1);
      pdf.setDrawColor(230, 230, 230);

      items.forEach(item => {
        pdf.text(String(item[keyNombre]), 20, posicionY);
        pdf.text(String(item._count[keyValor]), 180, posicionY, { align: 'center' });
        posicionY += 3;
        pdf.line(15, posicionY, 195, posicionY); // Línea separadora de fila
        posicionY += 6;
      });

      posicionY += 10; // Espaciado final de la sección
    };

    // INICIO DEL DOCUMENTO
    agregarEncabezado();

    // BLOQUE DE MÉTRICAS PRINCIPALES
    pdf.setFillColor(250, 250, 250);
    pdf.setDrawColor(220, 220, 220);
    pdf.roundedRect(15, posicionY, 180, this.esAdmin ? 35 : 25, 2, 2, 'FD'); // Más alto si es admin
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(74, 21, 37);
    pdf.text('Métricas Principales', 20, posicionY + 8);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    
    // Columna Izquierda
    pdf.text(`Expedientes Activos: ${this.estadisticas.totalExpedientes}`, 20, posicionY + 16);
    pdf.text(`Citas Programadas: ${this.obtenerTotalCitas()}`, 20, posicionY + 22);
    
    // Columna Derecha
    pdf.text(`Documentos Procesados: ${this.estadisticas.totalDocumentos}`, 105, posicionY + 16);
    pdf.text(`Categorías de Citas: ${this.estadisticas.citasPorTipo.length}`, 105, posicionY + 22);

    if (this.esAdmin) {
      pdf.text(`Usuarios Registrados: ${this.obtenerTotalUsuarios()}`, 20, posicionY + 28);
    }

    posicionY += this.esAdmin ? 45 : 35;

    // SECCIONES DETALLADAS
    dibujarTabla('Desglose por Estado del Expediente', this.estadisticas.expedientesPorEstado, 'estado', 'id_expediente');
    dibujarTabla('Desglose por Materia Jurídica', this.estadisticas.expedientesPorMateria, 'materia', 'id_expediente');
    dibujarTabla('Desglose de Citas por Tipo', this.estadisticas.citasPorTipo, 'tipo_cita', 'id_cita');

    // SOLO PARA ADMIN: Mostrar la tabla de usuarios
    if (this.esAdmin) {
      dibujarTabla('Accesos por Rol de Usuario', this.estadisticas.usuariosPorRol, 'rol', 'id_usuario');
    }

    agregarPiePagina();
    pdf.save(`Reporte_SGEJ_${new Date().getTime()}.pdf`);
  }
}