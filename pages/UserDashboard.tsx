
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Activity, Loan } from '../types';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../client-api/axios';

const UserDashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payReference, setPayReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, activitiesRes] = await Promise.all([
        api.get('/loans'),
        api.get('/activities')
      ]);
      setLoans(loansRes.data);
      setActivities(activitiesRes.data);

      // Fetch repayments for the active loan if exists
      const activeLoan = loansRes.data.find((l: any) => l.status === 'ACTIVE');
      if (activeLoan) {
        try {
          const repRes = await api.get(`/loans/${activeLoan._id}/repayments`);
          setRepayments(repRes.data);
        } catch (e) {
          console.error('Failed to fetch repayments', e);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeLoan = loans.find(l => l.status === 'ACTIVE');
    if (!activeLoan) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/loans/${activeLoan._id}/pay`, {
        amount: parseFloat(activeLoan.nextPaymentAmount.toString()),
        paymentMethod: 'Manual/Transfer',
        proof: payReference
      });
      alert(res.data.message || 'Payment initiated successfully.');
      setShowPayModal(false);
      setPayReference('');
      fetchData(); // Refresh data to show updated status
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (date: string | Date) => {
    return new Date(date) < new Date();
  };

  const totalBalance = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
  const activeLoan = loans.find(l => l.status === 'ACTIVE');

  // Chart Data from Repayments (Projected Balance)
  const chartData = [
    { name: 'Start', val: activeLoan?.amount || 0 },
    ...repayments.filter(r => r.status === 'CONFIRMED' || r.status === 'PAID').map((r, i) => ({
      name: `Pay ${i + 1}`,
      val: (activeLoan?.amount || 0) - ((i + 1) * r.amount) // Rough estimate for chart
    }))
  ];

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'apply', label: 'New Loan', icon: 'add_circle', path: '/new-loan' },
    { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' },
  ];

  return (
    <Layout className="pb-24 lg:pb-0" sidebarItems={sidebarItems}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-dark/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xs text-slate-400 font-medium">Welcome back,</h1>
            <h2 className="text-base font-bold text-white">{user?.name}</h2>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Balance Card */}
          <section className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <p className="text-slate-300 text-sm font-medium mb-2">Total Outstanding Balance</p>
              <p className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight">${totalBalance.toLocaleString()}</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Active Loans</p>
                  <p className="text-white text-xl font-bold">{loans.filter(l => l.status === 'ACTIVE').length}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Next Due Date</p>
                  <p className="text-white text-xl font-bold">
                    {activeLoan?.nextPaymentDate ? new Date(activeLoan.nextPaymentDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Repayment History Table */}
          <section className="bg-surface-dark rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-white font-bold text-lg">Repayment Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Paid On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {repayments.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No repayment history found.</td></tr>
                  ) : (
                    repayments.map((rep) => (
                      <tr key={rep._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">
                          {new Date(rep.dueDate).toLocaleDateString()}
                          {new Date(rep.dueDate) < new Date() && rep.status !== 'CONFIRMED' && rep.status !== 'PAID' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] rounded font-bold uppercase">Overdue</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">${rep.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${rep.status === 'CONFIRMED' || rep.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                            rep.status === 'PENDING_ADMIN_CONFIRMATION' ? 'bg-blue-500/10 text-blue-500' :
                              rep.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' :
                                'bg-slate-500/10 text-slate-400'
                            }`}>
                            {rep.status === 'PENDING_ADMIN_CONFIRMATION' ? 'Pending Approval' : rep.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {rep.paidDate ? new Date(rep.paidDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pay Now Card */}
          {activeLoan && (
            <section className={`p-6 rounded-3xl border ${isOverdue(activeLoan.nextPaymentDate) ? 'bg-rose-500/10 border-rose-500/20' : 'bg-surface-dark border-slate-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Upcoming Installment</p>
                    {isOverdue(activeLoan.nextPaymentDate) && (
                      <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded font-bold uppercase animate-pulse">Overdue</span>
                    )}
                  </div>
                  <p className="text-white text-3xl font-bold">${activeLoan.nextPaymentAmount}</p>
                  <p className={`text-xs mt-1 ${isOverdue(activeLoan.nextPaymentDate) ? 'text-rose-400' : 'text-slate-500'}`}>
                    Due {new Date(activeLoan.nextPaymentDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`w-10 h-10 rounded-full flex items-center justify-center ${isOverdue(activeLoan.nextPaymentDate) ? 'bg-rose-500/20 text-rose-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  <span className="material-symbols-outlined">payments</span>
                </span>
              </div>
              <button
                onClick={() => setShowPayModal(true)}
                className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${isOverdue(activeLoan.nextPaymentDate) ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                <span>Pay Now</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <p className="text-center text-xs text-slate-500 mt-3">
                Payments require admin confirmation.
              </p>
            </section>
          )}

          {/* Payment Modal */}
          {showPayModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-surface-dark border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Record Payment</h3>
                  <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount to Pay</label>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-mono text-xl">
                      ${activeLoan?.nextPaymentAmount}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction Reference / Proof</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Transaction ID or Reference"
                      className="w-full h-12 px-4 bg-surface-light border border-slate-700 rounded-xl text-white focus:ring-primary focus:border-primary transition-all"
                      value={payReference}
                      onChange={(e) => setPayReference(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-500 mt-2 italic">
                      Please enter the receipt ID or transaction reference from your bank transfer.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-primary/20"
                  >
                    {submitting ? 'Processing...' : 'Submit Payment Intention'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <section className="bg-surface-dark p-6 rounded-3xl border border-slate-800 flex-1">
            <h3 className="text-white font-bold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {activities.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No recent activity.</p>
              ) : activities.map((activity) => (
                <div key={activity._id || Math.random()} className="flex items-center gap-3 p-3 bg-card-dark rounded-xl border border-slate-700/30">
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${activity.type === 'LOAN_APPLIED' ? 'bg-blue-500/10 text-blue-500' :
                    activity.type === 'LOAN_APPROVED' ? 'bg-green-500/10 text-green-600' :
                      activity.type === 'LOAN_REJECTED' || activity.type === 'PAYMENT_REJECTED' ? 'bg-rose-500/10 text-rose-500' :
                        activity.type === 'PAYMENT_MADE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {activity.type === 'LOAN_APPLIED' ? 'assignment' :
                        activity.type === 'LOAN_APPROVED' ? 'check_circle' :
                          activity.type === 'LOAN_REJECTED' ? 'cancel' :
                            activity.type === 'PAYMENT_MADE' ? 'payments' : 'info'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">{activity.title}</p>
                    <p className="text-slate-500 text-[10px]">{new Date(activity.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
};

export default UserDashboard;
