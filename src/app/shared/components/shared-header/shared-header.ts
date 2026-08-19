import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Soluciona el glitch de RouterLink
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBellSolid, heroCog8ToothSolid } from '@ng-icons/heroicons/solid';
import { NotificationBellComponent } from '../notification-bell/notification-bell';
import { AuthService } from '../../../core/services/auth.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-shared-header',
  standalone: true,
  // Asegúrate de que NotificationBellComponent y RouterModule estén aquí adentro:
  imports: [CommonModule, RouterModule, NgIconComponent, NotificationBellComponent],
  viewProviders: [provideIcons({ heroBellSolid, heroCog8ToothSolid })],
  templateUrl: './shared-header.html'
})
export class SharedHeader implements OnInit {
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() mostrarIconos: boolean = true; 

  esAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const usuarioActual = this.authService.getUser();
    this.esAdmin = usuarioActual?.rol === 'Administrador';
  }
}