
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../client-api/axios';

const NewLoanApplication: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(4.5);
  const [tenure, setTenure] = useState(24);
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  React.useEffect(() => {
    const userStr = localStorage.getItem('user'); // Assuming user object is stored here? Or decode token?
    // Let's check api/auth/user first, or decode token. For simplicity, let's grab from storage if available, 
    // or fetch profile.
    // For this specific app structure, let's look at how SignUpPage saves it.
    // SignUpPage: localStorage.setItem('token', data.token); onLogin(data.user);
    // There is no global user context easily accessible here without prop drilling or context.
    // Let's fetch current user on mount.
    api.get('/auth/user').then(res => setUserRole(res.data.role)).catch(console.error);
  }, []);

  return (
    <Layout>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-background-dark/95 backdrop-blur-sm border-b border-slate-800">
        <button onClick={() => navigate(-1)} className="text-primary text-base font-medium p-2 -ml-2">Cancel</button>
        <h1 className="text-lg font-bold">New Application</h1>
        <div className="w-[60px]"></div>
      </header>

      <main className="flex-1 p-6 pb-32 space-y-6 max-w-2xl mx-auto w-full">
        <div>
          <h2 className="text-2xl font-bold text-white">Loan Details</h2>
          <p className="text-sm text-slate-400">Enter the details for the new loan request.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-20 pl-10 pr-4 bg-surface-dark border-slate-700 rounded-2xl text-3xl font-bold text-white focus:ring-primary shadow-sm transition-all focus:border-primary"
              />
            </div>
          </div>
        </div>

        {userRole === 'ADMIN' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-amber-500">Borrower Email (Admin Only)</label>
            <input
              type="email"
              value={borrowerEmail}
              onChange={(e) => setBorrowerEmail(e.target.value)}
              placeholder="Enter borrower's email address"
              className="w-full h-14 px-4 bg-surface-dark border-amber-500/50 rounded-xl text-white transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
            <p className="text-xs text-slate-500">Assign this loan to a specific user.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Interest Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-14 px-4 bg-surface-dark border-slate-700 rounded-xl text-lg font-medium text-white transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">percent</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tenure (Months)</label>
            <div className="relative flex items-center">
              <button onClick={() => setTenure(Math.max(1, tenure - 1))} className="absolute left-1 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white"><span className="material-symbols-outlined">remove</span></button>
              <input
                type="number"
                value={tenure}
                readOnly
                className="w-full h-14 px-4 bg-surface-dark border-slate-700 rounded-xl text-lg font-medium text-center text-white transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <button onClick={() => setTenure(tenure + 1)} className="absolute right-1 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white"><span className="material-symbols-outlined">add</span></button>
            </div>
          </div>
        </div>


        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Start Date</label>
          <div className="relative">
            <input type="date" className="w-full h-14 px-4 bg-surface-dark border-slate-700 rounded-xl text-white transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" defaultValue="2023-10-27" />
          </div>
        </div>

        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 transition-all duration-300 hover:bg-primary/10">
          <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-4 tracking-widest">Estimated Repayment</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300">Monthly Payment (EMI)</span>
            <span className="text-lg font-bold text-white">
              {(() => {
                const r = rate / 12 / 100;
                const n = tenure;
                const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                return isFinite(emi) ? `$${emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '$0.00';
              })()}
            </span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '70%' }}></div>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Interest Rate</span>
            <span className="text-slate-200 font-medium">{rate}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Total Tenure</span>
            <span className="text-slate-200 font-medium">{tenure} Months</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={async () => {
              try {
                await api.post('/loans', {
                  amount,
                  tenure,
                  type: 'Personal', // Defaulting for now
                  ...(userRole === 'ADMIN' && { borrowerEmail })
                });
                navigate('/dashboard');
              } catch (err: any) {
                const msg = err.response?.data?.message || 'Failed to submit application';
                alert(msg);
              }
            }}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors"
          >
            Submit Application <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </main>
    </Layout >
  );
};

export default NewLoanApplication;
