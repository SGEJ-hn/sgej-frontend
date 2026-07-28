import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroHome, 
  heroFolder, 
  heroDocument, 
  heroCalendar, 
  heroUsers, 
  heroChartPie, 
  heroArrowRightOnRectangle 
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({ 
      heroHome, 
      heroFolder, 
      heroDocument, 
      heroCalendar, 
      heroUsers, 
      heroChartPie, 
      heroArrowRightOnRectangle 
    })
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {}
