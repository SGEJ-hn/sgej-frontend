import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 animate-fade-in">
      <h1 class="text-3xl font-bold text-[#4B1623] mb-6">Reportes y Estadísticas</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Tarjeta 1 -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-[#4B1623]">
          <h3 class="text-gray-500 text-sm font-semibold uppercase tracking-wider">Casos Activos</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">124</p>
        </div>
        
        <!-- Tarjeta 2 -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-green-600">
          <h3 class="text-gray-500 text-sm font-semibold uppercase tracking-wider">Casos Resueltos (Mes)</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">18</p>
        </div>

        <!-- Tarjeta 3 -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-blue-600">
          <h3 class="text-gray-500 text-sm font-semibold uppercase tracking-wider">Nuevos Clientes</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">5</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center justify-center h-64 text-gray-400">
        [ Gráfico de Rendimiento Anual - Espacio Reservado ]
      </div>
    </div>
  `
})
export class ReportesComponent {}