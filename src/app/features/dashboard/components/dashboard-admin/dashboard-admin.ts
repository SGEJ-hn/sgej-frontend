import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Dashboard } from '../../../../core/services/dashboard';
import { DashboardData } from '../../../../core/models/dashboard.interface'; 
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header'; 
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroFolderSolid, heroBriefcaseSolid, heroUserGroupSolid, heroCheckCircleSolid} from '@ng-icons/heroicons/solid';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, ChartOptions, Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, SharedHeader, NgIconComponent, BaseChartDirective, RouterModule], 
  viewProviders: [provideIcons({ 
    heroFolderSolid, heroBriefcaseSolid, heroUserGroupSolid, heroCheckCircleSolid })],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin implements OnInit {
  
  dashboardData: DashboardData | null = null;
  cargando: boolean = true;
  error: string = '';

  saludo: string = ''; 
  fechaActual: string = '';
  mesActual: string = '';

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
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], 
    datasets: [
      { 
        data: [3, 9, 5, 2, 6, 5], 
        label: 'Abiertos', 
        backgroundColor: '#D2B48C',
        borderRadius: 2,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      },
      { 
        data: [5, 3, 7, 5, 5, 8], 
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
    labels: ['Civil', 'Mercantil', 'Familia', 'Laboral', 'Penal'], 
    datasets: [
      {
        data: [21, 14, 11, 9, 5], 
        backgroundColor: [
          '#D2B48C', 
          '#1F2937', 
          '#9CA3AF', 
          '#4B5563', 
          '#2563EB'  
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  constructor(
    private dashboardService: Dashboard,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.configurarFechaYSaludo();
    this.cargarDashboard();
  }

  configurarFechaYSaludo(): void {
    const fecha = new Date();
    const hora = fecha.getHours();

    if (hora >= 0 && hora < 12) {
      this.saludo = 'Buenos días, Administrador';
    } else if (hora >= 12 && hora < 19) {
      this.saludo = 'Buenas tardes, Administrador';
    } else {
      this.saludo = 'Buenas noches, Administrador';
    }

    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
    this.fechaActual = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.mesActual = meses[fecha.getMonth()];
  }

  cargarDashboard(): void {
    this.cargando = true;
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        console.log('✅ Datos reales del backend:', data); 

        // 1. FILTRADO DE CITAS (Mes actual y rango de 15 días)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const limite15Dias = new Date(hoy);
        limite15Dias.setDate(hoy.getDate() + 15);
        
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        const citasFiltradas = data.proximasCitas.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          
          const esMayorOIgualAHoy = fechaCita >= hoy;
          const estaEnRango15Dias = fechaCita <= limite15Dias;
          const esDelMesYAnioActual = fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === anioActual;

          return esMayorOIgualAHoy && estaEnRango15Dias && esDelMesYAnioActual;
        });

        // 2. ASIGNACIÓN AL DASHBOARD (Aquí usamos la variable recién declarada)
        this.dashboardData = {
          ...data,
          proximasCitas: citasFiltradas
        };

        // 3. GRÁFICA DE DONA (Materias)
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

        // 4. GRÁFICA DE BARRAS (Actividad Mensual)
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
      error: (err) => {
        console.error('Error al cargar dashboard', err);
        this.error = 'No se pudo cargar la información del dashboard.';
        this.cargando = false;
        this.cdr.detectChanges(); 
      }
    });
  }
}