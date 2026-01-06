
import React, { useState } from 'react';
import { UserRole, User, ThemeType } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, onLogout, children, activeTab, setActiveTab, theme, onThemeChange 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', roles: [UserRole.ADMIN, UserRole.HR, UserRole.WORKER], icon: '📊' },
    { id: 'attendance', label: 'Attendance', roles: [UserRole.ADMIN, UserRole.HR, UserRole.WORKER], icon: '📅' },
    { id: 'payroll', label: 'Payroll', roles: [UserRole.ADMIN, UserRole.HR, UserRole.WORKER], icon: '💰' },
    { id: 'calculator', label: 'Calculator', roles: [UserRole.WORKER, UserRole.ADMIN, UserRole.HR], icon: '🧮' },
    { id: 'employees', label: 'Employees', roles: [UserRole.ADMIN, UserRole.HR], icon: '👥' },
    { id: 'reports', label: 'Organization Reports', roles: [UserRole.ADMIN, UserRole.HR], icon: '📈' },
  ];

  const themes: { id: ThemeType; label: string; icon: string }[] = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'forest', label: 'Forest', icon: '🌲' },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));
  const activeIndex = filteredMenuItems.findIndex(item => item.id === activeTab);

  return (
    <div className="flex h-screen overflow-hidden theme-transition" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} theme-transition text-white flex flex-col relative z-20 shadow-2xl transition-all duration-500 ease-in-out`}
        style={{ backgroundColor: 'var(--color-sidebar)' }}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/5 relative z-10 bg-[var(--color-sidebar)]">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 transform hover:scale-110 transition-transform">B</div>
          {isSidebarOpen && <h1 className="text-xl font-black tracking-tight animate-in fade-in slide-in-from-left-4">BioPay</h1>}
        </div>

        <nav className="flex-1 mt-8 px-3 relative">
          {/* 1. Left Accent Slider */}
          {activeIndex !== -1 && (
            <div 
              className="absolute left-0 w-1.5 bg-blue-400 rounded-r-full shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20"
              style={{ 
                height: '40px',
                transform: `translateY(${activeIndex * 60 + 6}px)`,
              }}
            />
          )}

          {/* 2. Background Pill Slider */}
          {activeIndex !== -1 && (
            <div 
              className="absolute left-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
              style={{ 
                height: '52px',
                width: isSidebarOpen ? 'calc(100% - 24px)' : '52px',
                transform: `translateY(${activeIndex * 60}px)`,
              }}
            />
          )}

          <div className="relative z-10 space-y-2">
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-[52px] flex items-center gap-4 px-4 rounded-2xl transition-all duration-300 group relative ${
                  activeTab === item.id ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className={`text-xl flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className={`font-bold text-sm tracking-wide whitespace-nowrap animate-in fade-in slide-in-from-left-2 overflow-hidden ${
                    activeTab === item.id ? 'opacity-100' : 'opacity-80'
                  }`}>
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 relative z-10 bg-[var(--color-sidebar)]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/40 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all group"
          >
            <span className="text-xl group-hover:rotate-12 transition-transform">🚪</span>
            {isSidebarOpen && <span className="font-bold text-sm tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header 
          className="h-20 border-b flex items-center justify-between px-8 sticky top-0 z-20 theme-transition backdrop-blur-md"
          style={{ backgroundColor: 'rgba(var(--color-card-rgb, 255, 255, 255), 0.8)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-6">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="p-3 bg-[var(--color-bg)] hover:bg-[var(--color-border)] rounded-2xl text-[var(--color-text)] transition-all shadow-sm active:scale-90"
             >
               <span className="text-xl">{isSidebarOpen ? '◀' : '▶'}</span>
             </button>
             <div>
               <h2 className="text-xl font-black text-[var(--color-text)] tracking-tight capitalize">
                 {activeTab.replace('-', ' ')}
               </h2>
               <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                 Biometric Verified Node
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Theme Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="px-4 py-2.5 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:scale-105 transition-all flex items-center gap-3 text-sm font-bold shadow-sm"
              >
                {themes.find(t => t.id === theme)?.icon}
                <span className="hidden sm:inline">{themes.find(t => t.id === theme)?.label}</span>
              </button>
              
              {isThemeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsThemeMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-52 bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 p-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          theme === t.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'text-[var(--color-text)] hover:bg-[var(--color-bg)] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className="text-lg">{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-[var(--color-border)]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-[var(--color-text)] tracking-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl border-2 border-[var(--color-card)] shadow-xl transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 theme-transition" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
