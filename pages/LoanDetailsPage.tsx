
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const LoanDetailsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout className="pb-24">
      <header className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-md border-b border-transparent p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 text-white"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-lg font-bold">Personal Loan #4920</h1>
        <button className="p-2 text-white"><span className="material-symbols-outlined">settings</span></button>
      </header>

      <main className="p-4 space-y-6">
        {/* Summary Header */}
        <div className="flex flex-col items-center justify-center bg-surface-dark p-6 rounded-2xl border border-slate-800 ring-1 ring-white/5 shadow-lg">
          <p className="text-slate-400 text-sm font-medium">Remaining Balance</p>
          <h2 className="text-4xl font-black text-white mt-2 mb-1">$8,450.00</h2>
          <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-red-900/30 text-red-400">
            <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
            <span className="text-xs font-bold">Due Oct 15</span>
          </div>
          
          <div className="w-full mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-medium">56% Paid</span>
            </div>
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '56%' }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>$0</span>
              <span>$15,000</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-white">Loan Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <DetailCard label="Principal" val="$15,000" icon="payments" />
            <DetailCard label="Interest Rate" val="5.4% APR" icon="percent" />
            <DetailCard label="Term Length" val="36 Months" icon="date_range" />
            <DetailCard label="Start Date" val="Sep 2022" icon="history" />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-3 pb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Recent Activity</h3>
            <button className="text-primary text-sm font-medium">View All</button>
          </div>
          <div className="space-y-3">
            <ActivityItem title="Upcoming Payment" sub="Due Oct 15, 2023" val="$450.00" icon="upcoming" />
            <ActivityItem title="Installment 12" sub="Paid Sept 15, 2023" val="$450.00" icon="check" isPaid />
            <ActivityItem title="Installment 11" sub="Paid Aug 15, 2023" val="$450.00" icon="check" isPaid />
            <ActivityItem title="Installment 10" sub="Paid Jul 15, 2023" val="$450.00" icon="check" isPaid />
          </div>
        </section>
      </main>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/95 backdrop-blur-md border-t border-slate-800 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Next Payment</span>
            <span className="text-base font-bold text-white">$450.00</span>
          </div>
          <button className="flex-1 h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">credit_card</span>
            Pay Now
          </button>
        </div>
      </div>
    </Layout>
  );
};

const DetailCard: React.FC<{ label: string, val: string, icon: string }> = ({ label, val, icon }) => (
  <div className="bg-surface-dark p-4 rounded-xl border border-slate-800 ring-1 ring-white/5 space-y-1">
    <div className="text-primary"><span className="material-symbols-outlined text-[20px]">{icon}</span></div>
    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
    <p className="text-white text-lg font-bold">{val}</p>
  </div>
);

const ActivityItem: React.FC<{ title: string, sub: string, val: string, icon: string, isPaid?: boolean }> = ({ title, sub, val, icon, isPaid }) => (
  <div className={`flex items-center justify-between p-4 bg-surface-dark rounded-xl border border-slate-800 ${isPaid ? 'opacity-70' : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-white text-sm font-bold">{title}</p>
        <p className="text-slate-400 text-xs">{sub}</p>
      </div>
    </div>
    <p className="text-white text-sm font-bold">{val}</p>
  </div>
);

export default LoanDetailsPage;
