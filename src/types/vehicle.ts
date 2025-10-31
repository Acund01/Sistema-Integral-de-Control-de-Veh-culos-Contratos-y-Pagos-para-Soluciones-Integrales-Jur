// Enums del backend representados como uniones de literales
export type EstadoVehiculo = 'DISPONIBLE' | 'ALQUILADO' | 'MANTENIMIENTO';
export type TipoCombustible = 'GASOLINA' | 'DIESEL' | 'ELECTRICO' | 'HIBRIDO' | 'GLP';

// Entidades relacionadas
export interface Marca {
  id: string;
  nombre: string;
}

export interface Modelo {
  id: string;
  nombre: string;
  marca: Marca;
}

export interface TipoVehiculo {
  id: string;
  nombre: string;
}

// Entidad principal Vehiculo (coincide con el backend)
export interface Vehiculo {
  id: string;
  placa: string;
  modelo: Modelo;
  tipoVehiculo: TipoVehiculo;
  anioFabricacion: number;
  combustible: TipoCombustible;
  descripcion?: string;
  creadoEn: string;
  estado: EstadoVehiculo;
  activo: boolean;
}

// DTOs de creación/actualización
export interface CrearVehiculoDto {
  placa: string;
  modeloId: string;
  tipoVehiculoId: string;
  anioFabricacion: number;
  combustible: TipoCombustible;
  descripcion?: string;
}

export type ActualizarVehiculoDto = CrearVehiculoDto;

export interface ActualizarEstadoVehiculoDto {
  estado: EstadoVehiculo;
}

// DTOs compactos para integraciones (contratos/reportes)
export interface VehiculoContratoDto {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  tipoVehiculo: string;
}

export interface VehiculoReporteDto {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  tipoVehiculo: string;
  estado: EstadoVehiculo;
}

// Mantener estructura de estadísticas usada en la UI
export interface VehicleStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
}

// Alias temporal para compatibilidad en componentes existentes
export type Vehicle = Vehiculo;
