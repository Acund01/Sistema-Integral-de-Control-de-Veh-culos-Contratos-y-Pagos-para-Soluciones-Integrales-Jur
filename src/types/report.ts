export interface ReportStats {
  monthlyIncome: number;
  incomeChange: string;
  activeContracts: number;
  contractsChange: string;
  averageOccupancy: number;
  occupancyChange: string;
  newClients: number;
  clientsChange: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  contracts: number;
}

export interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string;
  lastGenerated: string;
  period: string;
  /** Endpoint relativo para descarga directa del Excel (ej: /excel/ingresos) */
  endpoint?: string;
  /** Identificador lógico del tipo de reporte para generación (ej: INGRESOS) */
  tipo?: string;
  /** Formato solicitado (xlsx, csv, pdf) */
  formato?: string;
}
