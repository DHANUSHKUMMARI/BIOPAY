
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface EmployeeManagementProps {
  employees: User[];
  onUpdateEmployees: (list: User[]) => void;
  onAddActivity: (text: string, status: 'success' | 'info' | 'warning') => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, onUpdateEmployees, onAddActivity }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.WORKER,
    department: 'Manufacturing',
    hourlyRate: '20'
  });

  // Filter is calculated based on current employees prop
  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.WORKER,
      department: 'Manufacturing',
      hourlyRate: '20'
    });
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (emp: User) => {
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department || 'Manufacturing',
      hourlyRate: emp.hourlyRate?.toString() || '20'
    });
    setEditingId(emp.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in required fields.");
      return;
    }

    const duplicate = employees.find(e => 
      e.email.toLowerCase() === formData.email.toLowerCase() && e.id !== editingId
    );
    if (duplicate) {
      alert("An employee with this email already exists.");
      return;
    }

    if (editingId) {
      const updatedList = employees.map(emp => {
        if (emp.id === editingId) {
          return {
            ...emp,
            name: formData.name,
            email: formData.email,
            role: formData.role as UserRole,
            department: formData.department,
            hourlyRate: parseFloat(formData.hourlyRate)
          };
        }
        return emp;
      });
      onUpdateEmployees(updatedList);
      onAddActivity(`Profile updated: ${formData.name}`, 'info');
    } else {
      const newEmp: User = {
        id: `u-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role as UserRole,
        department: formData.department,
        hourlyRate: parseFloat(formData.hourlyRate),
        joinedAt: new Date().toISOString().split('T')[0],
        fingerprintId: `fp-${Math.floor(1000 + Math.random() * 9000)}`
      };
      onUpdateEmployees([...employees, newEmp]);
      onAddActivity(`New ${formData.role} added: ${formData.name}`, 'success');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const targetEmp = employees.find(e => e.id === id);
    if (!targetEmp) return;

    if (window.confirm(`Are you sure you want to remove ${targetEmp.name}? This will permanently delete their biometric profile, attendance records, and payroll history.`)) {
      // Create a fresh list without the target employee
      const updatedList = employees.filter(e => e.id !== id);
      
      // Update global state in App component
      onUpdateEmployees(updatedList);
      
      // Log activity
      onAddActivity(`Employee profile and history purged: ${targetEmp.name}`, 'warning');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Employee Directory</h1>
          <p className="text-[var(--color-text-muted)] font-medium">Manage biometric profiles and access control levels.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
        >
          <span className="text-xl">➕</span>
          Add New Profile
        </button>
      </div>

      <div className="bg-[var(--color-card)] rounded-[2.5rem] shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="p-4 md:p-8 border-b border-[var(--color-border)] bg-[var(--color-bg)]/30">
          <div className="relative max-w-lg">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all text-sm font-bold placeholder:font-medium shadow-inner"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-[var(--color-bg)]/50 text-[var(--color-text-muted)] uppercase text-[10px] font-black tracking-[0.2em]">
                <th className="px-8 py-5">Employee Detail</th>
                <th className="px-8 py-5">System Role</th>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Biometric ID</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-[var(--color-bg)]/40 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg transform group-hover:scale-110 transition-transform">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[var(--color-text)] text-sm tracking-tight">{emp.name}</p>
                        <p className="text-xs font-medium text-[var(--color-text-muted)]">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      emp.role === UserRole.ADMIN 
                        ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' 
                        : emp.role === UserRole.HR 
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[var(--color-text)] opacity-70">{emp.department || 'Management'}</td>
                  <td className="px-8 py-5">
                    <code className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl font-black text-blue-500 shadow-inner">
                      {emp.fingerprintId || 'NOT-SET'}
                    </code>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-[var(--color-text)] uppercase tracking-widest">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                         onClick={() => handleEditClick(emp)}
                         className="w-10 h-10 rounded-xl bg-[var(--color-bg)] hover:bg-blue-500/10 text-[var(--color-text-muted)] hover:text-blue-500 transition-all flex items-center justify-center border border-[var(--color-border)] shadow-sm"
                       >✏️</button>
                       <button 
                         onClick={() => handleDelete(emp.id)}
                         className="w-10 h-10 rounded-xl bg-[var(--color-bg)] hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-all flex items-center justify-center border border-[var(--color-border)] shadow-sm"
                       >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-3xl mb-4">🔦</p>
                    <p className="text-[var(--color-text-muted)] font-black uppercase tracking-[0.2em]">No matching employees found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
           <div className="bg-[var(--color-card)] w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--color-border)] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col max-h-[95vh]">
              <div className="p-6 md:p-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/30 flex justify-between items-center">
                 <div>
                   <h3 className="text-xl md:text-2xl font-black text-[var(--color-text)] tracking-tight">
                     {editingId ? 'Edit Profile' : 'Create Profile'}
                   </h3>
                   <p className="text-[var(--color-text-muted)] font-medium text-xs md:text-sm">
                     {editingId ? 'Modify existing identity parameters.' : 'Assign identity and access levels.'}
                   </p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-all font-bold">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Legal Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 font-bold transition-all shadow-inner text-sm" 
                      placeholder="e.g. Michael Jordan" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Email Address (Login ID)</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 font-bold transition-all shadow-inner text-sm" 
                      placeholder="m.jordan@biopay.com" 
                    />
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">System Role</label>
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                        className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 font-bold transition-all shadow-inner text-sm appearance-none"
                      >
                        <option value={UserRole.WORKER}>Worker</option>
                        <option value={UserRole.HR}>HR Specialist</option>
                        <option value={UserRole.ADMIN}>System Admin</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Hourly Rate ($)</label>
                      <input 
                        type="number" 
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                        className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 font-bold transition-all shadow-inner text-sm" 
                        placeholder="25.00" 
                      />
                   </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Assigned Department</label>
                    <select 
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 font-bold transition-all shadow-inner text-sm appearance-none"
                    >
                        <option>Manufacturing</option>
                        <option>Logistics</option>
                        <option>Human Resources</option>
                        <option>Quality Assurance</option>
                        <option>Engineering</option>
                        <option>Operations</option>
                    </select>
                 </div>

                 <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <p className="text-[10px] text-blue-600 font-bold leading-relaxed uppercase tracking-wider">
                      {editingId 
                        ? "Note: Updating the role or department will affect future attendance logs and payroll calculations."
                        : "Note: Biometric ID and shift parameters are automatically provisioned upon first scan. Initial password is set to '123' by default."}
                    </p>
                 </div>
              </div>

              <div className="p-6 md:p-10 bg-[var(--color-bg)]/50 flex flex-col sm:flex-row gap-4 border-t border-[var(--color-border)] sticky bottom-0">
                 <button onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] font-black uppercase tracking-widest rounded-2xl hover:bg-[var(--color-bg)] transition-all shadow-sm active:scale-95 text-xs md:text-sm">Discard</button>
                 <button onClick={handleSave} className="flex-1 px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all transform active:scale-95 text-xs md:text-sm">
                   {editingId ? 'Update Profile' : 'Register Profile'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
