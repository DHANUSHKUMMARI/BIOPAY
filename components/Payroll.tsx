
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { PayrollRecord, User } from '../types';

interface PayrollProps {
  user: User;
  records: PayrollRecord[];
}

const Payroll: React.FC<PayrollProps> = ({ user, records }) => {
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);

  const downloadSlip = (record: PayrollRecord) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Blue-600
    doc.text("BIOPAY SALARY SLIP", 105, 20, { align: 'center' });
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 25, 190, 25);
    
    // Employee Info
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(`Employee Name: ${user.name}`, 20, 40);
    doc.text(`Employee Email: ${user.email}`, 20, 50);
    doc.text(`Biometric ID: ${user.fingerprintId || 'N/A'}`, 20, 60);
    doc.text(`Pay Period: ${record.month} ${record.year}`, 20, 70);
    
    doc.line(20, 75, 190, 75);
    
    // Earnings
    doc.setFont("helvetica", "bold");
    doc.text("EARNINGS", 20, 90);
    doc.setFont("helvetica", "normal");
    doc.text("Gross Pay", 20, 100);
    doc.text(`$${record.grossPay.toLocaleString()}`, 190, 100, { align: 'right' });
    
    // Deductions
    doc.setFont("helvetica", "bold");
    doc.text("DEDUCTIONS", 20, 120);
    doc.setFont("helvetica", "normal");
    doc.text("Tax & Other Deductions", 20, 130);
    doc.text(`-$${record.deductions.toLocaleString()}`, 190, 130, { align: 'right' });
    
    doc.setDrawColor(59, 130, 246);
    doc.line(20, 140, 190, 140);
    
    // Net Pay
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("NET PAYABLE", 20, 155);
    doc.text(`$${record.netPay.toLocaleString()}`, 190, 155, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139); // Muted Slate
    doc.text("This is a digitally generated document verified by BioPay Biometric System.", 105, 180, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 185, { align: 'center' });
    
    doc.save(`BioPay_Slip_${record.month}_${record.year}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Payroll Management</h1>
        <p className="text-[var(--color-text-muted)]">View salary history and download payslips.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)]">
            <h3 className="font-bold text-[var(--color-text)]">History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[var(--color-bg)] text-[var(--color-text-muted)] uppercase">
                  <th className="px-6 py-4 font-bold">Period</th>
                  <th className="px-6 py-4 font-bold">Hours</th>
                  <th className="px-6 py-4 font-bold">Net Pay</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-text)]">{record.month} {record.year}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{record.totalHours} hrs</td>
                    <td className="px-6 py-4 text-[var(--color-text)] font-bold">${record.netPay.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        record.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedSlip(record)}
                        className="text-blue-500 hover:text-blue-400 font-semibold"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] p-8 flex flex-col items-center">
          {selectedSlip ? (
            <div className="w-full space-y-6">
              <div className="text-center border-b border-[var(--color-border)] pb-6">
                 <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                   B
                 </div>
                 <h4 className="text-xl font-bold text-[var(--color-text)]">Salary Slip</h4>
                 <p className="text-sm text-[var(--color-text-muted)]">{selectedSlip.month} {selectedSlip.year}</p>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Employee</span>
                    <span className="font-semibold text-[var(--color-text)]">{user.name}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Total Hours</span>
                    <span className="font-semibold text-[var(--color-text)]">{selectedSlip.totalHours}h</span>
                 </div>
                 <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="text-[var(--color-text-muted)]">Gross Earnings</span>
                       <span className="font-semibold text-[var(--color-text)]">${selectedSlip.grossPay}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-500">
                       <span>Total Deductions</span>
                       <span>-${selectedSlip.deductions}</span>
                    </div>
                 </div>
                 <div className="bg-[var(--color-bg)] p-4 rounded-xl flex justify-between items-center border border-[var(--color-border)]">
                    <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase">Net Payable</span>
                    <span className="text-xl font-black text-[var(--color-text)]">${selectedSlip.netPay}</span>
                 </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => downloadSlip(selectedSlip)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  📥 Download PDF Slip
                </button>
                <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-4 uppercase tracking-widest">Digital verified document</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
               <div className="text-6xl mb-4 text-slate-400">📄</div>
               <p className="text-[var(--color-text-muted)] font-medium">Select a payroll record to<br/>view the detailed salary slip.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payroll;
