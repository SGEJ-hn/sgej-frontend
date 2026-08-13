import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

import { heroArrowUpTray, heroDocumentText} from '@ng-icons/heroicons/outline';
import { DragDrop } from '../../../../shared/directives/drag-drop';
import { Documentos } from '../../services/documentos';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { ExpedienteService } from '../../../../core/services/expediente';


@Component({
  selector: 'app-documentos-expediente',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDrop, NgIconComponent, RouterModule, SharedHeader],
  viewProviders: [provideIcons({ heroArrowUpTray, heroDocumentText })],
  templateUrl: './documentos-expediente.html',
  styleUrl: './documentos-expediente.css'
})
export class DocumentosExpediente implements OnInit {
  
  // Inyectamos el servicio
  private documentos = inject(Documentos);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); 
  private router = inject(Router); 
  private expedienteService = inject(ExpedienteService);

  // Variables del formulario
  nombreDocumento: string = '';
  categoriaSeleccionada: string = 'Escritos';
  expedienteAsociadoId = '';
  
  // 3. VARIABLES DINÁMICAS PARA LA VISTA
  numeroExpedienteVisual: string = 'Cargando...';
  nombreClienteVisual: string = '';
  
  archivoSeleccionado: File | null = null;
  documentosRecientes: any[] = [];
  estaSubiendo: boolean = false;
  progresoSubida: number = 0;
  mensajeExito: string = '';
  intervaloProgreso: any;

  ngOnInit() {
    this.expedienteAsociadoId = this.route.snapshot.paramMap.get('id_expediente') ?? '';
    if (this.expedienteAsociadoId) {
      this.cargarDocumentos();
      this.cargarDetalleExpediente();
    }
  }
  // 5. FUNCIÓN PARA OBTENER EL EXPEDIENTE
  cargarDetalleExpediente() {
    this.expedienteService.obtenerExpediente(this.expedienteAsociadoId).subscribe({
      next: (exp: any) => {
        this.numeroExpedienteVisual = exp.numero_expediente;
        this.nombreClienteVisual = this.obtenerNombreMostrar(exp);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando detalles del expediente', err)
    });
  }

  // 6. REUTILIZAMOS TU LÓGICA PARA SACAR EL NOMBRE CORRECTO
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

  cargarDocumentos() {
    this.documentos.obtenerDocumentos(this.expedienteAsociadoId).subscribe({
      next: (res: any) => {
        // El API puede responder con { documentos: [...] } o directamente con un arreglo.
        this.documentosRecientes = Array.isArray(res?.documentos)
          ? res.documentos
          : Array.isArray(res)
            ? res
            : [];
            
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando documentos', err)
    });
  }

  onFileDropped(file: File) {
    this.archivoSeleccionado = file;
    if (!this.nombreDocumento) {
      this.nombreDocumento = file.name;
    }
  }

  fileBrowseHandler(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.onFileDropped(file);
    }
  }

  subirDocumento() {
    if (!this.archivoSeleccionado) return;

    // 1. Preparamos la UI para empezar a subir
    this.estaSubiendo = true;
    this.progresoSubida = 0;
    this.mensajeExito = '';

    // 2. Simulamos el progreso visual de la barra (llega hasta 90%)
    this.intervaloProgreso = setInterval(() => {
      if (this.progresoSubida < 90) {
        this.progresoSubida += 10;
        this.cdr.detectChanges(); // Forzamos actualización visual
      }
    }, 200);

    // 3. Hacemos la petición real al servidor
    this.documentos.subirDocumento(
      this.expedienteAsociadoId,
      this.categoriaSeleccionada,
      this.nombreDocumento,
      this.archivoSeleccionado
    ).subscribe({
      next: (res) => {
        // 4. Cuando el servidor responde, completamos al 100%
        clearInterval(this.intervaloProgreso);
        this.progresoSubida = 100;
        this.mensajeExito = '¡El archivo se ha subido correctamente al sistema!';
        
        this.cargarDocumentos(); 
        this.limpiarFormulario(); 
        this.cdr.detectChanges();

        // 5. Ocultamos el mensaje y redireccionamos después de 2 segundos
        setTimeout(() => {
          this.estaSubiendo = false;
          this.mensajeExito = '';
          this.progresoSubida = 0;
          this.cdr.detectChanges();
          this.router.navigate(['/expedientes', this.expedienteAsociadoId, 'documentos']);
        }, 1000);
      },
      error: (err) => {
        clearInterval(this.intervaloProgreso);
        this.estaSubiendo = false;
        console.error('Error al subir el documento', err);
        alert('Hubo un error al subir el documento. Inténtalo de nuevo.');
      }
    });
  }

  // 3. Eliminar un archivo
  eliminar(id_documento: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      this.documentos.eliminarDocumento(id_documento).subscribe({
        next: () => {
          this.cargarDocumentos(); 
        },
        error: (err) => console.error('Error al eliminar', err)
      });
    }
  }

  limpiarFormulario() {
    this.archivoSeleccionado = null;
    this.nombreDocumento = '';
  }
}