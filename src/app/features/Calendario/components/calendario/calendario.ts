import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario {

  fechaActual: Date = new Date();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    height: 'auto',
    contentHeight: 'auto',

    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },

    eventDisplay: 'list-item',

    dayCellDidMount: (arg) => {
      if (arg.isToday) {
        const numero = arg.el.querySelector('.fc-daygrid-day-number') as HTMLElement;
        if (numero) {
          numero.style.background = '#5b1f2b';
          numero.style.color = 'white';
          numero.style.width = '36px';
          numero.style.height = '36px';
          numero.style.display = 'flex';
          numero.style.alignItems = 'center';
          numero.style.justifyContent = 'center';
          numero.style.borderRadius = '2px';
          numero.style.margin = '6px';
        }
      }
    },

    events: [
      { start: '2026-07-07', color: '#4CAF50' },
      { start: '2026-07-10', color: '#2196F3' },
      { start: '2026-07-22', color: '#FF9800' },
      { start: '2026-07-30', color: '#4CAF50' }
    ]
  };

}