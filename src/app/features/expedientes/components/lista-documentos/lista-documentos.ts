import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroEye, 
  heroArrowDownTray, 
  heroPencilSquare, 
  heroTrash, 
  heroArrowLeft, 
  heroPlus,
  heroDocumentText
} from '@ng-icons/heroicons/outline';
import { Documentos } from '../../services/documentos';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';

@Component({
  selector: 'app-lista-documentos',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent,FormsModule, SharedHeader],
  viewProviders: [provideIcons({ 
    heroEye, heroArrowDownTray, heroPencilSquare, heroTrash, heroArrowLeft, heroPlus, heroDocumentText 
  })],
  templateUrl: './lista-documentos.html',
  styleUrl: './lista-documentos.css'
})
export class ListaDocumentos implements OnInit {
  
  private documentosService = inject(Documentos);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); 

  expedienteId: string = '';
  documentos: any[] = [];
  terminoBusqueda: string = ''; 
  
  // Variables de Edición
  mostrarModalEdicion: boolean = false;
  documentoEnEdicion: any = null;
  editNombre: string = '';
  editCategoria: string = '';

  get documentosFiltrados() {
    if (!this.terminoBusqueda) {
      return this.documentos;
    }
    const termino = this.terminoBusqueda.toLowerCase();
    return this.documentos.filter(doc => 
      doc.nombre_documento.toLowerCase().includes(termino) || 
      doc.categoria.toLowerCase().includes(termino)
    );
  }  
  
  ngOnInit() {
    this.expedienteId = this.route.snapshot.paramMap.get('id_expediente') || '';
    if (this.expedienteId) {
      this.cargarDocumentos();
    }
  }

  cargarDocumentos() {
    this.documentosService.obtenerDocumentos(this.expedienteId).subscribe({
      next: (res: any) => {
        console.log('Datos recibidos del backend:', res);
        
        if (res && res.documentos) {
          this.documentos = res.documentos;
        } else if (Array.isArray(res)) {
          this.documentos = res;
        } else {
          this.documentos = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando la lista de documentos', err)
    });
  }

  eliminar(id_documento: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este documento permanentemente?')) {
      this.documentosService.eliminarDocumento(id_documento).subscribe({
        next: () => this.cargarDocumentos(), 
        error: (err) => console.error('Error al eliminar', err)
      });
    }
  }

  descargarDocumento(doc: any) {
    if (confirm(`¿Estás seguro de que deseas descargar el documento "${doc.nombre_documento}"?`)) {
      
      const url = doc.url_archivo;
      const extension = url.split('.').pop()?.split('?')[0]; 
      const nombreArchivo = `${doc.nombre_documento}.${extension}`;

      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error en la descarga');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = nombreArchivo;
          document.body.appendChild(a);
          a.click();
          
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
          console.error('Error forzando la descarga del documento', err);
          alert('Hubo un problema al intentar descargar el documento.');
        });
    }
  }

  // ==========================================
  // NUEVAS FUNCIONES PARA EL MODAL DE EDICIÓN
  // ==========================================

  abrirModalEditar(doc: any) {
    this.documentoEnEdicion = doc;
    this.editNombre = doc.nombre_documento; // Pre-cargamos el nombre actual
    this.editCategoria = doc.categoria;     // Pre-cargamos la categoría actual
    this.mostrarModalEdicion = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEdicion = false;
    this.documentoEnEdicion = null;
  }

  guardarEdicion() {
    if (!this.editNombre.trim() || !this.editCategoria.trim()) return;

    const datosActualizados = {
      nombre_documento: this.editNombre,
      categoria: this.editCategoria
    };

    // Llamamos al servicio para actualizar en la base de datos
    this.documentosService.actualizarDocumento(this.documentoEnEdicion.id_documento, datosActualizados).subscribe({
      next: () => {
        this.cargarDocumentos(); // Recargamos la tabla para ver los cambios
        this.cerrarModalEditar(); // Cerramos el modal
      },
      error: (err) => {
        console.error('Error al actualizar el documento', err);
        alert('Hubo un error al guardar los cambios.');
      }
    });
  }
  
}