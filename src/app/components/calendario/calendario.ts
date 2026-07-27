import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario {

  calendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth'
  };

}