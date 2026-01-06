
import React, { useState } from 'react';
import { AttendanceRecord, User } from '../types';

interface AttendanceProps {
  user: User;
  records: AttendanceRecord[];
  onUpdateRecords: (records: AttendanceRecord[]) => void;
  onAddActivity: (text: string, status: 'success' | 'info' | 'warning') => void;
}

const Attendance: React.FC<AttendanceProps> = ({ user, records, onUpdateRecords, onAddActivity }) => {
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'authenticated'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Helper to parse time string (e.g., "08:30 AM") to minutes since midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3];

    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  };

  // Helper to format decimal hours into "Xh Ym"
  const formatHoursMinutes = (decimalHours: number): string => {
    if (decimalHours === 0) return '0h 0m';
    const totalMinutes = Math.round(decimalHours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const startScan = () => {
    setScanStep('scanning');
    setStatusMessage(null);
    setTimeout(() => {
      setScanStep('authenticated');
    }, 2500);
  };

  const handleAction = (type: 'IN' | 'OUT') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];

    if (type === 'IN') {
      const newRecord: AttendanceRecord = {
        id: `a-${Date.now()}`,
        userId: user.id,
        date: dateStr,
        checkIn: timeStr,
        totalHours: 0,
        status: 'PRESENT'
      };
      onUpdateRecords([newRecord, ...records]);
      onAddActivity(`${user.name} checked in`, 'success');
      setStatusMessage(`Successfully checked in at ${timeStr}`);
    } else {
      const latestIdx = records.findIndex(r => r.userId === user.id && r.date === dateStr && !r.checkOut);
      
      if (latestIdx !== -1) {
        const checkInTime = records[latestIdx].checkIn;
        const inMins = parseTimeToMinutes(checkInTime);
        const outMins = parseTimeToMinutes(timeStr);
        const diffMins = Math.max(0, outMins - inMins);
        const calcHours = diffMins / 60;

        const updatedRecords = [...records];
        updatedRecords[latestIdx] = { 
          ...updatedRecords[latestIdx], 
          checkOut: timeStr,
          totalHours: Number(calcHours.toFixed(2))
        };
        onUpdateRecords(updatedRecords);
        onAddActivity(`${user.name} checked out (${formatHoursMinutes(calcHours)})`, 'success');
        setStatusMessage(`Successfully checked out at ${timeStr}. Total time: ${formatHoursMinutes(calcHours)}`);
      } else {
        setStatusMessage(`No active check-in found for today. Please check in first.`);
      }
    }

    setScanStep('idle');
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Present
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            Late
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Biometric Attendance</h1>
          <p className="text-[var(--color-text-muted)]">Optical biometric verification for secure logging.</p>
        </div>
        {scanStep === 'idle' && (
          <button 
            onClick={startScan}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all transform hover:scale-105"
          >
            <span className="text-xl">👆</span>
            Start Biometric Scan
          </button>
        )}
      </div>

      {statusMessage && (
        <div className={`bg-opacity-10 border px-6 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2 text-center font-bold ${
          statusMessage.includes('No active') ? 'bg-red-500 border-red-500/20 text-red-500' : 'bg-emerald-500 border-emerald-500/20 text-emerald-500'
        }`}>
          {statusMessage}
        </div>
      )}

      {scanStep !== 'idle' && (
        <div className="bg-[var(--color-card)] rounded-[2.5rem] p-12 border border-[var(--color-border)] shadow-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
           
           <div className="relative w-48 h-56 mb-8 flex items-end justify-center">
              <div className="absolute bottom-0 w-32 h-32 bg-slate-900 rounded-xl border-2 border-slate-700 overflow-hidden shadow-inner">
                 <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                 <svg className="absolute inset-0 w-full h-full text-blue-500/30 p-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.39 0 2.704.283 3.897.792M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
                 {scanStep === 'scanning' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_#3b82f6] animate-scan-line"></div>}
              </div>

              {/* Fix: Removed redundant scanStep === 'idle' check as this block is only rendered when scanStep is not 'idle' */}
              <div className={`z-10 w-24 h-48 bg-[#e8beac] rounded-t-full border-2 border-[#d4a38f] shadow-2xl transition-transform duration-700 ease-out -translate-y-4`}>
                 <div className="w-14 h-16 bg-[#f5d5c6] rounded-t-3xl mx-auto mt-4 border-b border-[#d4a38f]"></div>
              </div>

              {scanStep === 'authenticated' && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 z-20 rounded-full animate-in zoom-in duration-300">
                  <div className="bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg">✓</div>
                </div>
              )}
           </div>

           <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
             {scanStep === 'scanning' ? 'Scanning Pattern...' : 'Identity Confirmed'}
           </h3>
           <p className="text-[var(--color-text-muted)] max-w-xs mb-8">
             {scanStep === 'scanning' ? 'Matching ridge characteristics with secure hardware enclave...' : `Confirmed: ${user.name}. Select attendance action.`}
           </p>

           {scanStep === 'authenticated' && (
             <div className="flex gap-4 w-full max-w-sm">
               <button onClick={() => handleAction('IN')} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transform hover:scale-105 transition-all">Check In</button>
               <button onClick={() => handleAction('OUT')} className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl shadow-lg transform hover:scale-105 transition-all">Check Out</button>
             </div>
           )}

           <button onClick={() => setScanStep('idle')} className="mt-8 text-sm font-bold text-[var(--color-text-muted)] hover:text-red-500">Cancel</button>
        </div>
      )}

      {scanStep === 'idle' && (
        <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {records.filter(r => r.userId === user.id).map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--color-text)]">{record.date}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">{record.checkIn}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">{record.checkOut || '--:--'}</td>
                    <td className="px-6 py-4 text-[var(--color-text)] font-bold text-right">
                      {record.checkOut ? formatHoursMinutes(record.totalHours) : 'Active...'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
                {records.filter(r => r.userId === user.id).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)] italic">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line { animation: scan-line 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Attendance;
