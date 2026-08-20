import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { 
  heroEye, 
  heroArrowDownTray, 
  heroPencilSquare, 
  heroTrash, 
  heroArrowLeft, 
  heroPlus,
  heroDocumentText, 
  heroMagnifyingGlass
} from '@ng-icons/heroicons/outline';
import { Documentos } from '../../services/documentos';
import { SharedHeader } from '../../../../shared/components/shared-header/shared-header';
import { AuthService } from '../../../../core/services/auth.service';
import { ExpedienteService } from '../../../../core/services/expediente';

@Component({
  selector: 'app-lista-documentos',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent,FormsModule, SharedHeader],
  viewProviders: [provideIcons({ 
    heroEye, heroArrowDownTray, heroPencilSquare, heroTrash, heroArrowLeft, heroPlus, heroDocumentText, heroMagnifyingGlass 
  })],
  templateUrl: './lista-documentos.html',
  styleUrl: './lista-documentos.css'
})
export class ListaDocumentos implements OnInit {
  
  private documentosService = inject(Documentos);
  private expedienteService = inject(ExpedienteService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); 
  private authService = inject(AuthService);

  expedienteId: string = '';
  documentos: any[] = [];
  terminoBusqueda: string = ''; 
  expedienteCerrado: boolean = false;
  private searchSubject = new Subject<string>();
  
  mostrarModalEdicion: boolean = false;
  documentoEnEdicion: any = null;
  editNombre: string = '';
  editCategoria: string = '';
  subtituloDinamico: string = '';
  paginaActual: number = 1;
  limite: number = 7;
  totalPaginas: number = 1;
  totalEntradas: number = 0;

  get puedeGestionarDocumentos(): boolean {
    return ['Administrador', 'Abogado', 'Paralegal'].includes(this.authService.getUser()?.rol ?? '');
  }
  
  ngOnInit() {
    this.expedienteId = this.route.snapshot.paramMap.get('id_expediente') || '';
    if (this.expedienteId) {
      this.verificarEstadoExpediente();
      this.cargarDocumentos();
    }

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged() 
    ).subscribe(termino => {
      this.terminoBusqueda = termino;
      this.ejecutarBusqueda();
    });
  }

  //  Consulta el estado del expediente
  verificarEstadoExpediente(): void {
    this.expedienteService.obtenerExpediente(this.expedienteId).subscribe({
      next: (exp) => {
        const estado = exp.estado?.toLowerCase();
        this.expedienteCerrado = estado === 'cerrado' || estado === 'archivado';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al verificar estado del expediente:', err)
    });
  }

  // 👇 NUEVA FUNCIÓN que se conectará al HTML
  onSearchChange(termino: string) {
    this.searchSubject.next(termino);
  }

  cargarDocumentos() {
    this.documentosService.obtenerDocumentos(this.expedienteId, this.paginaActual, this.limite, this.terminoBusqueda).subscribe({
      next: (res: any) => {
        console.log('Datos recibidos del backend:', res);
        
        if (res && res.documentos) {
          this.documentos = res.documentos;
          
          // 👇 Capturamos datos de paginación
          this.totalPaginas = res.total_paginas || 1;
          this.totalEntradas = res.total || 0;

          const numExp = res.numero_expediente || '';
          const cliente = res.nombre_cliente || '';
          
          if (numExp && cliente) {
            this.subtituloDinamico = `${numExp} • ${cliente}`;
          } else {
            this.subtituloDinamico = 'Datos del expediente no disponibles';
          }
          
        } else if (Array.isArray(res)) {
          this.documentos = res;
        } else {
          this.documentos = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando la lista de documentos', err);
        this.subtituloDinamico = 'Error al cargar los datos';
      }
    });
  }

  ejecutarBusqueda() {
    this.paginaActual = 1;
    this.cargarDocumentos();
  }

  // Proteger método de eliminación adicionalmente por TS
  eliminar(id_documento: string) {
    if (this.expedienteCerrado) {
      alert('No se pueden eliminar documentos de un expediente cerrado.');
      return;
    }
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

  // Proteger edición por TS
  abrirModalEditar(doc: any) {
    if (this.expedienteCerrado) {
      alert('No se pueden editar documentos de un expediente cerrado.');
      return;
    }
    this.documentoEnEdicion = doc;
    this.editNombre = doc.nombre_documento; 
    this.editCategoria = doc.categoria;   
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

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarDocumentos();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarDocumentos();
    }
  }
  
}
