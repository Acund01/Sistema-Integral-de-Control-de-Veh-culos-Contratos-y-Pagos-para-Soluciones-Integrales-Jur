export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  plate: string;
  fuel: string;
  lastMaintenance: string;
  status: 'Disponible' | 'Alquilado' | 'Mantenimiento';
}

export interface VehicleStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
}
