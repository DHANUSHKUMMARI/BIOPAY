
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface PayrollCalculatorProps {
  user: User;
}

const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({ user }) => {
  const [rate, setRate] = useState<number>(user.hourlyRate || 20);
  const [hours, setHours] = useState<number>(40);
  const [overtime, setOvertime] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(15);

  const regularPay = hours * rate;
  const overtimePay = overtime * (rate * 1.5);
  const grossPay = regularPay + overtimePay;
  const taxAmount = (grossPay * taxRate) / 100;
  const netPay = grossPay - taxAmount;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Earnings Estimator</h1>
        <p className="text-[var(--color-text-muted)]">Plan your finances by calculating potential take-home pay.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-[var(--color-card)] p-8 rounded-[2rem] border border-[var(--color-border)] shadow-sm space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Hourly Rate ($)</label>
              <span className="text-xl font-black text-blue-500">${rate}</span>
            </div>
            <input 
              type="range" min="15" max="100" step="1" 
              value={rate} onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-[var(--color-bg)] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Regular Hours</label>
              <span className="text-xl font-black text-[var(--color-text)]">{hours}h</span>
            </div>
            <input 
              type="range" min="0" max="80" step="1" 
              value={hours} onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-2 bg-[var(--color-bg)] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Overtime (1.5x)</label>
              <span className="text-xl font-black text-amber-500">{overtime}h</span>
            </div>
            <input 
              type="range" min="0" max="40" step="1" 
              value={overtime} onChange={(e) => setOvertime(Number(e.target.value))}
              className="w-full h-2 bg-[var(--color-bg)] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Estimated Tax (%)</label>
              <span className="text-xl font-black text-red-500">{taxRate}%</span>
            </div>
            <input 
              type="range" min="0" max="40" step="1" 
              value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full h-2 bg-[var(--color-bg)] rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl transform group-hover:scale-110 transition-transform">💰</div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Estimated Net Take-Home</p>
            <h2 className="text-5xl font-black tracking-tighter mb-6">${netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="opacity-70 font-medium">Gross Earnings</span>
                <span className="font-bold">${grossPay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70 font-medium">Total Deductions</span>
                <span className="font-bold text-red-200">-${taxAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-card)] p-8 rounded-[2rem] border border-[var(--color-border)] shadow-sm flex-1 space-y-6">
            <h3 className="font-bold text-[var(--color-text)]">Earnings Breakdown</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[var(--color-text-muted)]">
                  <span>REGULAR PAY</span>
                  <span>${regularPay.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(regularPay / grossPay) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[var(--color-text-muted)]">
                  <span>OVERTIME BONUS</span>
                  <span>${overtimePay.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(overtimePay / grossPay) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[var(--color-text-muted)]">
                  <span>TAX DEDUCTION</span>
                  <span>${taxAmount.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(taxAmount / grossPay) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
               <p className="text-[10px] text-blue-500 font-bold leading-relaxed">
                 *This calculation is an estimate for informational purposes only. Actual payroll amounts may vary based on specific local taxes, benefits contributions, and company policies.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollCalculator;
