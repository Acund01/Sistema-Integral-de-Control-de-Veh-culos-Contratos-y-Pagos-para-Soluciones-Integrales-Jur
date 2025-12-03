// Tipos alineados al backend de contratos

export interface DetalleContratoDto {
  idVehiculo: string; // UUID
  precioDiario: number;
}

export interface ContratoRequestDto {
  idCliente: string; // UUID
  fechaInicio: string; // LocalDate (YYYY-MM-DD)
  fechaFin: string; // LocalDate (YYYY-MM-DD)
  observaciones?: string;
  detalles: DetalleContratoDto[];
}

export interface VehiculoDto {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  tipoVehiculo: string;
  imagenUrl?: string;
}

export interface DetalleContratoResponseDto {
  idDetalle: string;
  idVehiculo: string;
  precioDiario: number;
  diasAlquiler: number;
  subtotal: number;
  placaVehiculo: string;
  marcaVehiculo: string;
  modeloVehiculo: string;
  vehiculo: VehiculoDto | null;
}

export interface ClienteDto {
  id: string;
  nombre: string; // nombre mostrado del cliente
  tipo: 'NATURAL' | 'EMPRESA';
}

export interface ContratoResponseDto {
  id: string;
  codigoContrato: string;
  cliente: ClienteDto;
  detalles: DetalleContratoResponseDto[];
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  diasTotales: number;
  montoTotal: number;
  estado: string;
  observaciones?: string;
  fechaCreacion: string; // LocalDateTime ISO
  actualizadoEn: string; // LocalDateTime ISO
}

// Estadísticas usadas en la UI
export interface ContractStats {
  total: number;
  active: number;
  expiring: number;
  monthlyIncome: number;
}
