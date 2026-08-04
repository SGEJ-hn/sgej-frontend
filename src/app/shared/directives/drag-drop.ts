import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDrop {
  // Emite el archivo capturado hacia el componente
  @Output() fileDropped = new EventEmitter<File>();

  // Cambia la clase CSS dinámicamente cuando el archivo está sobre la zona
  @HostBinding('class.fileover') fileOver: boolean = false;

  // Escucha cuando el archivo entra a la zona
  @HostListener('dragover', ['$event']) onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  // Escucha cuando el archivo sale de la zona
  @HostListener('dragleave', ['$event']) onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  // Escucha cuando el usuario suelta el archivo
  @HostListener('drop', ['$event']) onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;

    const files = evt.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileDropped.emit(files[0]); // Emitimos el primer archivo soltado
    }
  }
}