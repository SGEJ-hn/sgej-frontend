import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {

  constructor(private router: Router) {}

  // Verifica si estamos en el login
  isLoginRoute(): boolean {
    return this.router.url === '/' ||
           this.router.url.startsWith('/login');
  }

}