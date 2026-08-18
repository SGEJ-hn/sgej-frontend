import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroFolderSolid, 
  heroCalendarSolid, 
  heroDocumentTextSolid, 
  heroCheckCircleSolid 
} from '@ng-icons/heroicons/solid';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';


import { Dashboard } from '../../../../core/services/dashboard'; 
import { AuthService } from '../../../../core/services/auth.service'; 
import { LawyerDashboardData } from '../../../../core/models/dashboard.interface';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header'; 

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-abogado',
  standalone: true,
  imports: [CommonModule, SharedHeader, NgIconComponent, BaseChartDirective, RouterModule], 
  viewProviders: [provideIcons({ 
    heroFolderSolid, 
    heroCalendarSolid, 
    heroDocumentTextSolid, 
    heroCheckCircleSolid 
  })],
  templateUrl: './dashboard-abogado.html',
  styleUrl: './dashboard-abogado.css',
})
export class DashboardAbogado implements OnInit {
  
  // Tipado estricto con la interfaz que creamos
  dashboardData: LawyerDashboardData | null = null;
  cargando: boolean = true;
  error: string = '';

  saludo: string = ''; 
  fechaActual: string = '';
  mesActual: string = '';
  nombreAbogado: string = ''; 
  proximaAudienciaTexto: string = 'Sin citas';

  // Inyección de dependencias
  private dashboardService = inject(Dashboard);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // ==========================================
  // CONFIGURACIÓN GRÁFICA 1: BARRAS
  // ==========================================
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { 
        beginAtZero: true, 
        border: { display: false },
        grid: { color: '#f3f4f6' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 30, usePointStyle: true, boxWidth: 8, font: { family: 'DM Sans', size: 12 } }
      }
    }
  };
  
  public barChartData: ChartData<'bar'> = {
    labels: [], 
    datasets: [
      { 
        data: [], 
        label: 'Abiertos', 
        backgroundColor: '#D2B48C',
        borderRadius: 2,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      },
      { 
        data: [], 
        label: 'Cerrados', 
        backgroundColor: '#374151', 
        borderRadius: 2,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      }
    ]
  };

  // ==========================================
  // CONFIGURACIÓN GRÁFICA 2: DONA (Pastel)
  // ========================================== 
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 15, font: { family: 'DM Sans', size: 12 } }
      }
    }
  };

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [], 
    datasets: [
      {
        data: [], 
        backgroundColor: ['#D2B48C', '#1F2937', '#9CA3AF', '#4B5563', '#2563EB'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  ngOnInit(): void {
    // 1. Obtener datos del usuario desde el AuthService
    const usuario = this.authService.getUser();
    if (usuario && usuario.nombre) {
      // Extraer solo el primer nombre y apellido si es necesario, o usarlo completo
      this.nombreAbogado = usuario.nombre;
    } else {
      this.nombreAbogado = 'Abogado';
    }
    
    this.configurarFechaYSaludo();
    this.cargarDashboard();
  }

  configurarFechaYSaludo(): void {
    const fecha = new Date();
    const hora = fecha.getHours();

    if (hora >= 0 && hora < 12) {
      this.saludo = `Buenos días, ${this.nombreAbogado}`;
    } else if (hora >= 12 && hora < 19) {
      this.saludo = `Buenas tardes, ${this.nombreAbogado}`;
    } else {
      this.saludo = `Buenas noches, ${this.nombreAbogado}`;
    }

    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
    this.fechaActual = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.mesActual = meses[fecha.getMonth()];
  }

  cargarDashboard(): void {
    this.cargando = true;
    
    this.dashboardService.getLawyerDashboard().subscribe({
      next: (data: LawyerDashboardData) => {
        this.dashboardData = data;

        // Establecer el texto de la próxima audiencia para el KPI
        if (data.proximasCitas && data.proximasCitas.length > 0) {
           const proxCita = new Date(data.proximasCitas[0].fecha);
           this.proximaAudienciaTexto = `${proxCita.getDate()} ${proxCita.toLocaleString('es-ES', { month: 'short' })}`;
        } else {
           this.proximaAudienciaTexto = 'Sin citas';
        }

        // 1. GRÁFICA DE DONA (Materias del Abogado)
        if (data.graficas && data.graficas.expedientesPorMateria) {
          const nombresMaterias = data.graficas.expedientesPorMateria.map(m => m.materia);
          const cantidadesMaterias = data.graficas.expedientesPorMateria.map(m => m._count.materia);

          this.doughnutChartData = {
            labels: nombresMaterias,
            datasets: [
              {
                ...this.doughnutChartData.datasets[0], 
                data: cantidadesMaterias 
              }
            ]
          };
        }

        // 2. GRÁFICA DE BARRAS (Actividad Mensual del Abogado)
        if (data.graficas && data.graficas.actividadMensual) {
          this.barChartData = {
            labels: data.graficas.actividadMensual.meses,
            datasets: [
              { 
                ...this.barChartData.datasets[0], 
                data: data.graficas.actividadMensual.abiertos 
              },
              { 
                ...this.barChartData.datasets[1], 
                data: data.graficas.actividadMensual.cerrados 
              }
            ]
          };
        }

        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error al cargar el dashboard del abogado:', err);
        this.error = 'No se pudo cargar la información de tu panel. Verifica tu conexión o permisos.';
        this.cargando = false;
        this.cdr.detectChanges(); 
      }
    });
  }
  obtenerNombreMostrar(expediente: any): string {
  const partes = expediente.partes_involucradas || expediente.partes;
  if (partes && partes.length > 0) {
    const demandante = partes.find(
      (p: any) => p.clasificacion?.toLowerCase() === 'demandante'
    );
    if (demandante && demandante.nombre_completo) {
      return demandante.nombre_completo;
    }
  }
  return expediente.cliente?.nombre || 'Sin registro';
}

  
}