import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; 

export interface Documento {
  id_documento: string;
  id_expediente: string;
  nombre_documento: string;
  categoria: string;
  url_archivo: string;
  tamano_mb: number;
  fecha_carga: string;
}

export interface DocumentosResponse {
  documentos: Documento[];
}

@Injectable({
  providedIn: 'root'
})
export class Documentos {
  private apiUrl = `${environment.apiUrl}/documentos`; 

  constructor(private http: HttpClient) { }

  // POST: Subir un nuevo archivo
  subirDocumento(id_expediente: string, categoria: string, nombre_documento: string, archivo: File): Observable<{ mensaje: string; documento: Documento }> {
    const formData = new FormData();
    formData.append('id_expediente', id_expediente);
    formData.append('categoria', categoria);
    formData.append('nombre_documento', nombre_documento);
    formData.append('archivo', archivo);

    return this.http.post<{ mensaje: string; documento: Documento }>(`${this.apiUrl}/upload`, formData);
  }

  // GET: Obtener todos los documentos de un expediente
  obtenerDocumentos(id_expediente: string): Observable<DocumentosResponse> {
    return this.http.get<DocumentosResponse>(`${this.apiUrl}/expediente/${id_expediente}`);
  }

  // DELETE: Eliminar un documento por su ID
  eliminarDocumento(id_documento: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id_documento}`);
  }

  // PATCH (o PUT): Actualizar datos de un documento (Nombre y Categoría)
  actualizarDocumento(id_documento: string, datos: { nombre_documento: string, categoria: string }): Observable<any> {
    // Nota: Si tu backend requiere un PUT en lugar de PATCH, simplemente cambia "this.http.patch" por "this.http.put"
    return this.http.patch(`${this.apiUrl}/${id_documento}`, datos);
  }
}