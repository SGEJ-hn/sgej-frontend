import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../models/dashboard.interface'; 
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class Dashboard {
  private apiUrl = `${environment.apiUrl}/dashboard`; 

  constructor(private http: HttpClient) { }

  getAdminDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/admin`);
  }
}