
export interface LogEntry {
  id: string;
  date: string; // ISO format
  distance: number; // in km
}

export interface User {
  id: string;
  name: string;
  joinDate: string;
  logs: LogEntry[];
}

export interface DailyReport {
  date: string;
  target: number;
  run: number;
  debtAdded: number;
  debtCleared: number;
  cumulativeDebt: number;
  cumulativeTarget: number;
  cumulativeRun: number;
}

export interface UserStatsSummary {
  id: string;
  name: string;
  totalRun: number;
  currentDebt: number;
  status: 'CLEAR' | 'DEBT';
  reports: DailyReport[];
}
