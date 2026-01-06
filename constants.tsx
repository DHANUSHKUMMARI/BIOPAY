
import { User, UserRole, AttendanceRecord, PayrollRecord } from './types';

// Helper to generate dates relative to today
const getRecentDate = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@biopay.com',
    role: UserRole.ADMIN,
    joinedAt: '2023-01-01',
  },
  {
    id: 'u2',
    name: 'Sarah HR',
    email: 'sarah@biopay.com',
    role: UserRole.HR,
    joinedAt: '2023-02-15',
  },
  {
    id: 'w1',
    name: 'John Doe',
    email: 'john@biopay.com',
    role: UserRole.WORKER,
    department: 'Manufacturing',
    hourlyRate: 25,
    joinedAt: '2023-03-10',
    fingerprintId: 'fp-1001'
  },
  {
    id: 'w2',
    name: 'Jane Smith',
    email: 'jane@biopay.com',
    role: UserRole.WORKER,
    department: 'Logistics',
    hourlyRate: 22,
    joinedAt: '2023-04-05',
    fingerprintId: 'fp-1002'
  }
];

// Programmatically generate 30 days of records for a robust "continuous" look
const generateAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const workerIds = ['w1', 'w2'];
  
  for (let i = 0; i < 35; i++) {
    const date = getRecentDate(i);
    const day = new Date(date).getDay();
    
    // Skip weekends for more realistic data
    if (day === 0 || day === 6) continue;

    workerIds.forEach(userId => {
      // Randomize hours slightly (7.5 to 9.5 hours)
      const hours = 7.5 + Math.random() * 2;
      records.push({
        id: `gen-${userId}-${i}`,
        userId,
        date,
        checkIn: '08:00 AM',
        checkOut: '05:00 PM',
        totalHours: Number(hours.toFixed(2)),
        status: 'PRESENT'
      });
    });
  }
  return records;
};

export const MOCK_ATTENDANCE: AttendanceRecord[] = generateAttendance();

export const MOCK_PAYROLL: PayrollRecord[] = [
  { 
    id: 'p1', 
    userId: 'w1', 
    month: new Date().toLocaleString('default', { month: 'long' }), 
    year: new Date().getFullYear(), 
    totalHours: 168.5, 
    grossPay: 4212.5, 
    deductions: 420, 
    netPay: 3792.5, 
    status: 'PAID' 
  },
  { 
    id: 'p2', 
    userId: 'w2', 
    month: new Date().toLocaleString('default', { month: 'long' }), 
    year: new Date().getFullYear(), 
    totalHours: 158.2, 
    grossPay: 3480.4, 
    deductions: 310, 
    netPay: 3170.4, 
    status: 'PAID' 
  },
];
