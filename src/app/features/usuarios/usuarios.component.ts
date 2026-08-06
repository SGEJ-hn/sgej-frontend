import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-[#4B1623]">Gestión de Usuarios</h1>
        <button class="bg-[#4B1623] text-white px-4 py-2 rounded shadow hover:bg-[#3a111b] transition">
          + Agregar Usuario
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-700 border-b border-gray-200">
              <th class="p-4 font-semibold">Nombre</th>
              <th class="p-4 font-semibold">Correo</th>
              <th class="p-4 font-semibold">Rol</th>
              <th class="p-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="p-4 font-medium text-gray-900">Carlos Mendoza</td>
              <td class="p-4">cmendoza&#64;justice.law</td>
              <td class="p-4">Administrador</td>
              <td class="p-4 text-[#4B1623] cursor-pointer hover:underline">Editar</td>
            </tr>
            <tr class="hover:bg-gray-50 transition">
              <td class="p-4 font-medium text-gray-900">Ana Lucía Ramírez</td>
              <td class="p-4">aramirez&#64;justice.law</td>
              <td class="p-4">Abogado Junior</td>
              <td class="p-4 text-[#4B1623] cursor-pointer hover:underline">Editar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UsuariosComponent {}