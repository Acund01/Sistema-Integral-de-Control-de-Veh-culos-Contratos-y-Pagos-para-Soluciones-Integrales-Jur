// Tipo que coincide con el enum TipoCliente del backend
export type TipoCliente = 'NATURAL' | 'EMPRESA';

// Entidad base Cliente (coincide con Cliente.java)
export interface Cliente {
  id: string; // UUID en el backend
  tipoCliente: TipoCliente;
  correo: string;
  telefono: string;
  direccion?: string;
  creadoEn: string; // OffsetDateTime en ISO format
  activo: boolean;
}

// Representante (coincide con Representante.java)
export interface Representante {
  id: string;
  nombre: string;
  apellido: string;
  tipoDocumento: string; // DNI / CE / Pasaporte
  numeroDocumento: string;
  cargo?: string;
  correo?: string;
  telefono?: string;
}

// Cliente Natural (coincide con ClienteNatural.java)
export interface ClienteNatural extends Cliente {
  tipoCliente: 'NATURAL';
  tipoDocumento: string; // DNI, CE, PASAPORTE
  numeroDocumento: string;
  nombre: string;
  apellido: string;
}

// Cliente Empresa (coincide con ClienteEmpresa.java)
export interface ClienteEmpresa extends Cliente {
  tipoCliente: 'EMPRESA';
  razonSocial: string;
  ruc: string;
  giroComercial?: string;
  direccionFiscal?: string;
  representante?: Representante;
}

// Union type para trabajar con ambos tipos de clientes
export type ClienteUnion = ClienteNatural | ClienteEmpresa;

// DTOs que coinciden con el backend
export interface ClienteNaturalDto {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  direccion?: string;
}

export interface RepresentanteDto {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  cargo?: string;
  correo?: string;
  telefono?: string;
}

export interface ClienteEmpresaDto {
  razonSocial: string;
  ruc: string;
  giroComercial?: string;
  direccionFiscal?: string;
  representante?: RepresentanteDto;
  correo: string;
  telefono: string;
  direccion?: string;
}

// DTO para obtener cliente para contrato
export interface ClienteContratoDto {
  id: string;
  tipoCliente: TipoCliente;
  nombreCompleto: string;
  correo: string;
  telefono: string;
}

// DTO para reportes
export interface ClienteReporteDto {
  id: string;
  tipoCliente: TipoCliente;
  nombreCompleto: string;
  correo: string;
  telefono: string;
}

// Estadísticas de clientes
export interface ClientStats {
  total: number;
  active: number;
  newThisMonth: number;
}
