
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout className="h-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="text-primary flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-primary text-[24px]">account_balance_wallet</span>
          </div>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold">LoanTracker</h2>
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col lg:flex-row-reverse items-center justify-between px-6 lg:px-24 py-12 lg:py-20 gap-12 max-w-7xl mx-auto">
        <div className="w-full lg:w-1/2 relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
          <img
            src="https://picsum.photos/seed/loan/1200/800"
            className="w-full h-full object-cover"
            alt="Dashboard Preview"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent mix-blend-overlay"></div>
        </div>

        <div className="w-full lg:w-1/2 space-y-6 text-left">
          <h1 className="text-gray-900 dark:text-white text-5xl lg:text-7xl font-black leading-tight tracking-tight">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Loans</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl leading-relaxed max-w-lg">
            The all-in-one platform for professional lending and borrowing. Track terms, calculate EMIs, and manage repayment schedules with enterprise-grade precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => navigate('/signup')}
              className="h-14 px-8 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="h-14 px-8 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all text-lg"
            >
              Log In
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-24 pb-20 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-white text-3xl lg:text-4xl font-black mb-4">Ready to take control?</h2>
            <p className="text-slate-300 text-base lg:text-lg mb-8">Join thousands of users utilizing our professional tools for better financial health.</p>
            <button
              onClick={() => navigate('/signup')}
              className="h-14 px-10 bg-white text-slate-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
