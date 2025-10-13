export interface Contract {
  id: string;
  contractNumber: string;
  clientName: string;
  vehicle: string;
  vehiclePlate: string;
  vehicleType: string;
  period: number;
  total: number;
  dailyRate: number;
  startDate: string;
  endDate: string;
  status: 'Activo' | 'Finalizado' | 'Por Vencer' | 'Pendiente';
}

export interface ContractStats {
  total: number;
  active: number;
  expiring: number;
  monthlyIncome: number;
}
