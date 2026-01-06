
export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  WORKER = 'WORKER'
}

export type ThemeType = 'light' | 'forest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  hourlyRate?: number;
  joinedAt: string;
  fingerprintId?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface PayrollRecord {
  id: string;
  userId: string;
  month: string;
  year: number;
  totalHours: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
}

export interface DashboardStats {
  totalEmployees: number;
  todayAttendance: number;
  pendingPayroll: number;
  monthlyPayout: number;
}
