import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-[#4B1623]">Expedientes Activos</h1>
        <button routerLink="/expedientes/6b650cd6-dc60-4de5-80db-674986f4249e/documentos" class="bg-[#4B1623] text-white px-4 py-2 rounded shadow hover:bg-[#3a111b] transition cursor-pointer">
          Documentos
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-700 border-b border-gray-200">
              <th class="p-4 font-semibold">N° Expediente</th>
              <th class="p-4 font-semibold">Cliente</th>
              <th class="p-4 font-semibold">Materia</th>
              <th class="p-4 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="p-4">EXP-2026-0142</td>
              <td class="p-4">Grupo Empresarial Vidal S.A.</td>
              <td class="p-4">Corporativo</td>
              <td class="p-4"><span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">En Proceso</span></td>
            </tr>
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="p-4">EXP-2026-0143</td>
              <td class="p-4">María Fernanda López</td>
              <td class="p-4">Familia</td>
              <td class="p-4"><span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Audiencia Pendiente</span></td>
            </tr>
            <tr class="hover:bg-gray-50 transition">
              <td class="p-4">EXP-2026-0144</td>
              <td class="p-4">Inmobiliaria Sur</td>
              <td class="p-4">Civil</td>
              <td class="p-4"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Resolución</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ExpedientesComponent {}