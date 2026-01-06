
import React, { useState, useEffect } from 'react';
import { User, UserRole, AttendanceRecord, PayrollRecord, ThemeType } from './types';
import { MOCK_USERS, MOCK_ATTENDANCE, MOCK_PAYROLL } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import EmployeeManagement from './components/EmployeeManagement';
import Reports from './components/Reports';
import PayrollCalculator from './components/PayrollCalculator';

export interface Activity {
  id: string;
  text: string;
  time: string;
  date: string;
  status: 'success' | 'info' | 'warning';
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Global state for users - persistent across sessions
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('biopay_all_users_v2');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  // Centralized state for real-time updates - persistent across sessions
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('biopay_attendance_v2');
    return saved ? JSON.parse(saved) : MOCK_ATTENDANCE;
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('biopay_payroll_v2');
    return saved ? JSON.parse(saved) : MOCK_PAYROLL;
  });

  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', text: 'Biometric kernel ready', time: '07:00 AM', date: 'Today', status: 'info' },
    { id: '2', text: 'Shift patterns synchronized', time: '07:30 AM', date: 'Today', status: 'success' },
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('biopay_user_v2');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const current = users.find(u => u.id === parsed.id);
      if (current) setUser(current);
    }
    
    const savedTheme = localStorage.getItem('biopay_theme_v2') as ThemeType;
    if (savedTheme === 'light' || savedTheme === 'forest') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [users]);

  // Persistence Syncing
  useEffect(() => {
    localStorage.setItem('biopay_all_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('biopay_attendance_v2', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('biopay_payroll_v2', JSON.stringify(payroll));
  }, [payroll]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('biopay_theme_v2', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const addActivity = (text: string, status: 'success' | 'info' | 'warning' = 'info') => {
    const now = new Date();
    const newActivity: Activity = {
      id: Date.now().toString(),
      text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      status
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const foundUser = users.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase());
    if (foundUser && loginForm.password === '123') {
      setUser(foundUser);
      localStorage.setItem('biopay_user_v2', JSON.stringify(foundUser));
      addActivity(`${foundUser.name} logged in`, 'success');
      setLoginForm({ email: '', password: '' });
    } else {
      setLoginError('Authentication failed. Use password "123" for any valid email.');
    }
  };

  const handleLogout = () => {
    if (user) addActivity(`${user.name} logged out`, 'info');
    setUser(null);
    localStorage.removeItem('biopay_user_v2');
  };

  const updateEmployees = (updatedList: User[]) => {
    const removedUserIds = users.filter(u => !updatedList.some(nu => nu.id === u.id)).map(u => u.id);

    // Perform state updates functionally to ensure they are based on the latest values
    if (removedUserIds.length > 0) {
      setAttendance(prev => prev.filter(rec => !removedUserIds.includes(rec.userId)));
      setPayroll(prev => prev.filter(rec => !removedUserIds.includes(rec.userId)));
    }

    setUsers([...updatedList]);
    
    // Auto-logout if the current session was deleted
    if (user && !updatedList.some(u => u.id === user.id)) {
      handleLogout();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-900">
        <style>{`
          .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .bg-gradient-mesh {
            background: radial-gradient(circle at 0% 0%, #1e40af 0%, transparent 50%),
                        radial-gradient(circle at 100% 100%, #7e22ce 0%, transparent 50%),
                        radial-gradient(circle at 100% 0%, #3b82f6 0%, transparent 50%),
                        radial-gradient(circle at 0% 100%, #ec4899 0%, transparent 50%);
            background-color: #0f172a;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up {
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        <div className="w-full max-w-lg z-10 animate-slide-up">
          <div className="glass-effect rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10">
            <div className="p-12 pb-8 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-white font-black text-4xl">B</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-3">BioPay Access</h1>
              <p className="text-blue-200/50 font-medium tracking-wide">Secure Biometric Node</p>
            </div>
            
            <form onSubmit={handleLogin} className="px-12 pb-12 space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-3 ml-2">Email Identity</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">📧</span>
                    <input 
                      type="email" 
                      required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      placeholder="user@biopay.com"
                      className="w-full pl-16 pr-6 py-5 bg-white/5 text-white border border-white/5 rounded-[2rem] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/40 focus:bg-white/10 transition-all outline-none placeholder:text-white/10 text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-3 ml-2">Secure Pin</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">🔑</span>
                    <input 
                      type="password" 
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full pl-16 pr-6 py-5 bg-white/5 text-white border border-white/5 rounded-[2rem] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/40 focus:bg-white/10 transition-all outline-none placeholder:text-white/10 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 py-3 rounded-2xl animate-pulse">
                  <p className="text-xs font-bold text-red-400 text-center uppercase tracking-widest">{loginError}</p>
                </div>
              )}

              <div className="space-y-4">
                <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-[2rem] hover:bg-blue-500 shadow-2xl shadow-blue-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3">
                  Login
                  <span className="text-xl">→</span>
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setLoginForm({email: 'admin@biopay.com', password: '123'})} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-2xl border border-white/5 transition-all">Admin Node</button>
                  <button type="button" onClick={() => setLoginForm({email: 'jane@biopay.com', password: '123'})} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-2xl border border-white/5 transition-all">Worker Node</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} attendance={attendance} payroll={payroll} activities={activities} theme={theme} />;
      case 'attendance':
        return <Attendance user={user} records={attendance} onUpdateRecords={(newRecords) => setAttendance(newRecords)} onAddActivity={addActivity} />;
      case 'payroll':
        return <Payroll user={user} records={payroll.filter(p => p.userId === user.id || user.role !== UserRole.WORKER)} />;
      case 'calculator':
        return <PayrollCalculator user={user} />;
      case 'employees':
        return <EmployeeManagement employees={users} onUpdateEmployees={updateEmployees} onAddActivity={addActivity} />;
      case 'reports':
        return <Reports attendance={attendance} payroll={payroll} theme={theme} />;
      default:
        return <Dashboard user={user} attendance={attendance} payroll={payroll} activities={activities} theme={theme} />;
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} onThemeChange={handleThemeChange}>
      {renderContent()}
    </Layout>
  );
};

export default App;
