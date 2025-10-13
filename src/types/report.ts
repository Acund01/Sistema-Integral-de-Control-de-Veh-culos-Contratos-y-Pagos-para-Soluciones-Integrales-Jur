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
}
