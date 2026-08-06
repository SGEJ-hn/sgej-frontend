import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBellSolid, heroCog8ToothSolid } from '@ng-icons/heroicons/solid';
import { NotificationBellComponent } from '../notification-bell/notification-bell';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NotificationBellComponent],
  viewProviders: [provideIcons({ heroBellSolid, heroCog8ToothSolid })],
  templateUrl: './shared-header.html'
})
export class SharedHeader {
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() mostrarIconos: boolean = true; 
}