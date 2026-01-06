
import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, UserRole, AttendanceRecord, PayrollRecord, ThemeType } from '../types';
import { Activity } from '../App';

interface DashboardProps {
  user: User;
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  activities: Activity[];
  theme: ThemeType;
}

const Dashboard: React.FC<DashboardProps> = ({ user, attendance, payroll, activities, theme }) => {
  const [timeframe, setTimeframe] = useState<'7days' | '30days'>('7days');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.HR;

  const userAttendance = useMemo(() => {
    return isAdmin ? attendance : attendance.filter(r => r.userId === user.id);
  }, [attendance, isAdmin, user.id]);

  const chartData = useMemo(() => {
    const days = timeframe === '7days' ? 7 : 30;
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Calculate daily total for all users if admin, else just the user
      const dailyHours = userAttendance
        .filter(r => r.date === dateStr)
        .reduce((sum, rec) => sum + rec.totalHours, 0);

      result.push({
        name: timeframe === '7days' ? dayName : dateStr.split('-')[2],
        hours: dailyHours,
        fullDate: dateStr
      });
    }
    return result;
  }, [userAttendance, timeframe]);

  const hasData = useMemo(() => chartData.some(d => d.hours > 0), [chartData]);

  const isDark = theme === 'forest';
  const textColor = isDark ? '#a7f3d0' : '#64748b';
  const gridColor = isDark ? '#047857' : '#f1f5f9';
  const chartAccent = isDark ? '#10b981' : '#3b82f6';

  const workerStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthNum = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthPrefix = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}`;
    
    const totalHoursMonth = userAttendance
      .filter(r => r.date.startsWith(monthPrefix))
      .reduce((acc, curr) => acc + curr.totalHours, 0);

    const estPay = totalHoursMonth * (user.hourlyRate || 20);

    return [
      { label: 'Hours This Month', value: `${totalHoursMonth.toFixed(1)}h`, icon: '⏱️', color: 'bg-blue-500' },
      { label: 'Est. Gross Pay', value: `$${estPay.toLocaleString()}`, icon: '💵', color: 'bg-emerald-500' },
      { label: 'Designation', value: user.department || 'Staff', icon: '🏷️', color: 'bg-indigo-500' },
      { label: 'Status', value: 'Active', icon: '⚡', color: 'bg-amber-500' },
    ];
  }, [userAttendance, user]);

  const stats = isAdmin ? [
    { label: 'Total Workers', value: '128', icon: '👥', color: 'bg-blue-500' },
    { label: 'Today Attendance', value: `${attendance.filter(r => r.date === new Date().toISOString().split('T')[0]).length}/128`, icon: '✅', color: 'bg-emerald-500' },
    { label: 'Pending Payroll', value: '12', icon: '⏳', color: 'bg-amber-500' },
    { label: 'Monthly Payout', value: '$45.2k', icon: '💰', color: 'bg-indigo-500' },
  ] : workerStats;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
            {isAdmin ? 'System Intelligence' : `Hello, ${user.name.split(' ')[0]}!`}
          </h1>
          <p className="text-[var(--color-text-muted)] font-medium">
            {isAdmin ? 'Real-time workforce metrics and payroll status.' : `Viewing your personal biometric productivity data.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[var(--color-card)] p-6 rounded-3xl shadow-sm border border-[var(--color-border)] flex items-center gap-5 group hover:scale-[1.02] transition-transform duration-300 cursor-default">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg shadow-black/5 transform group-hover:rotate-6 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--color-text)] tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--color-card)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-black text-xl text-[var(--color-text)] tracking-tight">
                Continuous Labor Flow
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Biometric Productivity Tracking</p>
            </div>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value as any)} 
              className="text-sm border border-[var(--color-border)] bg-[var(--color-bg)] rounded-xl px-4 py-2 font-bold outline-none text-[var(--color-text)] hover:border-blue-500 transition-colors shadow-sm cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-72 w-full relative">
            {!hasData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-text-muted)] z-20 bg-[var(--color-card)]/60 backdrop-blur-sm rounded-xl">
                 <span className="text-4xl mb-3">📈</span>
                 <p className="text-xs font-black uppercase tracking-[0.25em]">No log stream detected</p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartAccent} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={chartAccent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: textColor, fontSize: 10, fontWeight: 700}} 
                  dy={15}
                  interval={timeframe === '30days' ? 4 : 0} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: textColor, fontSize: 11, fontWeight: 700}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    borderRadius: '24px', 
                    border: '1px solid var(--color-border)', 
                    color: 'var(--color-text)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '16px'
                  }} 
                  itemStyle={{ fontWeight: 800, color: chartAccent }}
                  labelStyle={{ marginBottom: '6px', opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}
                  cursor={{ stroke: chartAccent, strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke={chartAccent} 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  activeDot={{ r: 8, fill: chartAccent, strokeWidth: 3, stroke: '#fff' }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--color-card)] p-8 rounded-[2.5rem] border border-[var(--color-border)] flex flex-col shadow-sm">
          <div className="mb-8">
            <h3 className="font-black text-xl text-[var(--color-text)] tracking-tight">Recent Activity</h3>
            <p className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Live Audit Feed</p>
          </div>
          <div className="space-y-6 flex-1">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex gap-5 items-start group">
                <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${
                  activity.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                } group-hover:scale-125 transition-transform`} />
                <div className="flex-1 border-b border-[var(--color-border)] pb-4 group-last:border-0">
                  <p className="text-sm font-bold text-[var(--color-text)] leading-tight mb-1">{activity.text}</p>
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{activity.date} • {activity.time}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40">
                 <span className="text-4xl mb-4">📭</span>
                 <p className="text-sm font-bold italic">No updates available.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowActivityModal(true)} 
            className="w-full mt-8 py-4 text-xs font-black text-blue-600 hover:bg-blue-500/5 rounded-2xl transition-all border border-blue-500/20 uppercase tracking-[0.2em] shadow-sm active:scale-95"
          >
            Audit History
          </button>
        </div>
      </div>

      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowActivityModal(false)}></div>
          <div className="relative bg-[var(--color-card)] w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--color-border)] flex flex-col max-h-[85vh]">
             <div className="p-10 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg)]/30">
                <div>
                  <h3 className="text-2xl font-black text-[var(--color-text)] tracking-tight">Audit History</h3>
                  <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Full System Event Log</p>
                </div>
                <button onClick={() => setShowActivityModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text)] hover:bg-red-500/10 hover:text-red-500 transition-all text-xl font-bold bg-[var(--color-bg)] shadow-inner">✕</button>
             </div>
             <div className="p-10 overflow-y-auto space-y-8 custom-scrollbar">
                {activities.map((activity) => (
                   <div key={activity.id} className="flex gap-6 items-start">
                      <div className={`w-4 h-4 mt-1.5 rounded-full flex-shrink-0 shadow-sm ${
                        activity.status === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-500 shadow-blue-500/20'
                      }`} />
                      <div className="flex-1">
                         <div className="flex justify-between items-start gap-4 mb-1">
                            <h4 className="text-sm font-black text-[var(--color-text)] leading-snug">{activity.text}</h4>
                            <span className="text-[10px] font-black text-blue-500 bg-blue-500/5 px-2 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap">{activity.time}</span>
                         </div>
                         <p className="text-xs font-bold text-[var(--color-text-muted)]">{activity.date} • Transaction ID: {activity.id}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
