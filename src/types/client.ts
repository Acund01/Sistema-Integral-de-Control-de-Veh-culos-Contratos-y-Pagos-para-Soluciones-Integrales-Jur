export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  contracts: number;
  status: 'Activo' | 'Inactivo';
  avatar?: string;
}

export interface ClientStats {
  total: number;
  active: number;
  newThisMonth: number;
}
