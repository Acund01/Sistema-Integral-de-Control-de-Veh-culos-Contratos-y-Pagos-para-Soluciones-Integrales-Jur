// Tipos para el sistema de gestión de alquiler de vehículos

import type { ReactNode } from 'react';

export interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface Activity {
  id: string;
  description: string;
  time: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  description: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
}

export interface User {
  username: string;
  name: string;
}
