
import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../client-api/axios';

const AdminDashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [loans, setLoans] = React.useState<any[]>([]);
  const [pendingRepayments, setPendingRepayments] = React.useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetchLoans();
    fetchPendingRepayments();
  };

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/loans');
      setLoans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingRepayments = async () => {
    try {
      const { data } = await api.get('/loans/repayments/pending');
      setPendingRepayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/loans/${id}`, { status });
      fetchLoans();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handlePaymentAction = async (id: string, status: 'CONFIRMED' | 'REJECTED') => {
    let remarks = '';
    if (status === 'REJECTED') {
      remarks = prompt('Enter remarks for rejection:') || '';
      if (!remarks && status === 'REJECTED') return;
    }

    if (confirm(`Are you sure you want to ${status} this payment?`)) {
      try {
        await api.post(`/loans/repayments/${id}/confirm`, { status, remarks });
        fetchPendingRepayments();
        fetchLoans(); // Refresh loans to see updated balances
      } catch (err: any) {
        alert(err.response?.data?.message || 'Action failed');
      }
    }
  };

  const pendingLoans = loans.filter(l => l.status === 'PENDING');
  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const totalDisbursed = activeLoans.reduce((sum, l) => sum + l.amount, 0);

  // Generate real chart data based on active loans for admin
  const dynamicChartData = [
    { name: 'M1', val: 0 },
    { name: 'M2', val: 0 },
    { name: 'M3', val: 0 },
    { name: 'M4', val: 0 },
    { name: 'M5', val: 0 },
    { name: 'M6', val: 0 },
  ];

  if (loans.length > 0) {
    const now = new Date();
    loans.forEach(loan => {
      const dateToUse = loan.createdAt || loan.startDate || new Date();
      const loanDate = new Date(dateToUse);
      const monthDiff = (now.getMonth() - loanDate.getMonth() + 12) % 12;
      const index = 5 - monthDiff;
      if (index >= 0 && index <= 5) {
        dynamicChartData[index].val += loan.amount / 1000;
      }
    });
  }

  const sidebarItems = [
    { id: 'home', label: 'Overview', icon: 'dashboard', path: '/admin' },
    { id: 'loans', label: 'Loans', icon: 'account_balance', path: '/admin/loans' },
    { id: 'users', label: 'Users', icon: 'group', path: '/admin/users' },
    { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' },
  ];

  return (
    <Layout className="pb-24 lg:pb-0" sidebarItems={sidebarItems}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-dark/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Loan Overview</h1>
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">search</span>
            <input
              type="text"
              placeholder="Search..."
              className="h-10 pl-10 pr-4 bg-surface-dark border border-slate-700 rounded-lg text-sm text-white focus:ring-primary w-64"
            />
          </div>
          <button onClick={() => navigate('/login')} className="w-9 h-9 rounded-full bg-primary/20 text-primary overflow-hidden ring-2 ring-slate-800">
            <img src="https://picsum.photos/seed/admin/100/100" className="w-full h-full object-cover" alt="Admin" />
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Key Metrics */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Disbursed" value={`$${(totalDisbursed / 1000).toFixed(1)}k`} trend="+0%" color="blue" icon="payments" />
            <MetricCard label="Active Loans" value={activeLoans.length.toString()} color="purple" icon="group" />
            <MetricCard label="Pending Loans" value={pendingLoans.length.toString()} color="amber" icon="pending_actions" />
            <MetricCard label="Pending Payments" value={pendingRepayments.length.toString()} color="emerald" icon="request_quote" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Repayment Trends Chart */}
          <section className="bg-surface-dark p-6 rounded-2xl border border-slate-800 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">Repayment Trends</h3>
              <select className="bg-slate-800 text-xs text-slate-300 border-none rounded-lg px-3 py-1.5 focus:ring-0">
                <option>Last 6 Months</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicChartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={40}>
                    {dynamicChartData.map((entry, index) => (
                      <Cell key={index} fill={index === 5 ? '#1173d4' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Pending Approvals Column */}
          <section className="space-y-6">

            {/* Payment Approvals */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Payment Approvals</h3>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full">{pendingRepayments.length}</span>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {pendingRepayments.length === 0 ? (
                  <div className="text-center py-6 bg-surface-dark rounded-xl border border-dashed border-slate-800">
                    <p className="text-slate-500 text-sm">No pending payments.</p>
                  </div>
                ) : pendingRepayments.map(rep => (
                  <div key={rep._id} className="p-3 bg-surface-dark rounded-xl border border-slate-800 shadow-sm hover:border-emerald-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white text-sm font-bold">${rep.amount.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">{(rep.borrowerId as any)?.name || 'Unknown'}</p>
                        {rep.proof && (
                          <p className="text-[10px] text-emerald-400 mt-1 font-mono">Ref: {rep.proof}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                        {new Date(rep.paidDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handlePaymentAction(rep._id, 'REJECTED')} className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-colors">Reject</button>
                      <button onClick={() => handlePaymentAction(rep._id, 'CONFIRMED')} className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20">Confirm</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan Approvals */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Loan Approvals</h3>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">{pendingLoans.length}</span>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {pendingLoans.length === 0 ? (
                  <div className="text-center py-6 bg-surface-dark rounded-xl border border-dashed border-slate-800">
                    <p className="text-slate-500 text-sm">No pending loans.</p>
                  </div>
                ) : pendingLoans.map(loan => (
                  <div key={loan._id} className="flex items-center justify-between p-3 bg-surface-dark rounded-xl border border-slate-800 shadow-sm hover:border-amber-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">{(loan.borrowerId as any)?.name?.[0] || 'U'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{(loan.borrowerId as any)?.name || 'Unknown'}</p>
                        <p className="text-slate-400 text-xs font-medium">${loan.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleStatusUpdate(loan._id, 'REJECTED')} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                      <button onClick={() => handleStatusUpdate(loan._id, 'ACTIVE')} className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors"><span className="material-symbols-outlined text-[18px]">check</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>

        {/* Active Loans Management */}
        <section className="bg-surface-dark p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Active Loan Management</h3>
            <span className="text-slate-400 text-xs font-medium">{activeLoans.length} active agreements</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-4 pt-2">Borrower</th>
                  <th className="pb-4 pt-2">Progress</th>
                  <th className="pb-4 pt-2">Balance</th>
                  <th className="pb-4 pt-2">Next Payment</th>
                  <th className="pb-4 pt-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeLoans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No active loans found.</td>
                  </tr>
                ) : activeLoans.map(loan => (
                  <tr key={loan._id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                          {(loan.borrowerId as any)?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{(loan.borrowerId as any)?.name}</p>
                          <p className="text-slate-500 text-[10px]">{(loan.typeId as any)?.name || 'Standard'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${loan.repaidPercentage}%` }}></div>
                        </div>
                        <span className="text-white text-[10px] font-bold">{loan.repaidPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-white text-sm font-bold font-mono">${loan.remainingBalance.toLocaleString()}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-emerald-500 text-sm font-bold font-mono">${loan.nextPaymentAmount}</p>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-slate-500 text-xs italic">View Only</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </Layout>
  );
};

const MetricCard: React.FC<{ label: string, value: string, trend?: string, color: string, icon: string }> = ({ label, value, trend, color, icon }) => (
  <div className="bg-surface-dark p-4 rounded-xl border border-slate-800 space-y-2">
    <div className="flex justify-between items-start">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${color}-500/10 text-${color}-500`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      {trend && (
        <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
          {trend} <span className="material-symbols-outlined text-[10px] ml-0.5">trending_up</span>
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">{label}</p>
      <p className="text-white text-xl font-bold">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
