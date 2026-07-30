import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'sgej-frontend';
  private _isLoginRoute = signal(true);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this._isLoginRoute.set(event.urlAfterRedirects.startsWith('/login') || event.urlAfterRedirects === '/');
      });
  }

  isLoginRoute(): boolean {
    return this._isLoginRoute();
  }
}