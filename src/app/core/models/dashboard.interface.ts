export interface DashboardData {
  kpis: Kpis;
  graficas: Graficas;
  expedientesRecientes: ExpedienteReciente[];
  proximasCitas: ProximaCita[];
}

export interface Kpis {
  expedientesActivos: number;
  abogadosActivos: number;
  clientesRegistrados: number;
  casosResueltos: number;
}

export interface Graficas {
  expedientesPorMateria: MateriaCount[];
  actividadMensual: ActividadMensual;
}

export interface ActividadMensual {
  meses: string[];
  abiertos: number[];
  cerrados: number[];
}

export interface MateriaCount {
  materia: string;
  _count: { materia: number };
}

export interface ExpedienteReciente {
  id_expediente: string;
  numero_expediente: string;
  materia: string;
  estado: string;
  fecha_apertura: string;
  cliente: { nombre: string };
  equipo?: {
    user: { nombre: string };
  }[];
}

export interface ProximaCita {
  id_cita: string;
  titulo: string;
  tipo_cita: string;
  fecha: string;
  hora_inicio: string;
  lugar_sala: string;
  expediente: {
    numero_expediente: string;
    cliente: { nombre: string };
  };
}