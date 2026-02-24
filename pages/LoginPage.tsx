
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import api from '../api/axios';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
        role: activeRole
      });
      localStorage.setItem('token', data.token);
      onLogin(data.user);

      if (data.user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1c2127] rounded-xl shadow-lg border border-slate-200 dark:border-[#3b4754] overflow-hidden">
        <div className="flex items-center justify-center p-6 pb-2">
          <div className="flex items-center gap-2">
            <div className="text-primary p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <h2 className="text-white text-xl font-bold">LoanTracker</h2>
          </div>
        </div>

        <div className="px-6 pt-2">
          <div className="flex p-1 bg-slate-100 dark:bg-[#111418] rounded-lg border dark:border-[#3b4754] mb-6">
            <button
              onClick={() => setActiveRole(UserRole.ADMIN)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${activeRole === UserRole.ADMIN ? 'bg-white dark:bg-[#1c2127] text-primary dark:text-white shadow-sm' : 'text-slate-500'
                }`}
            >
              Admin Login
            </button>
            <button
              onClick={() => setActiveRole(UserRole.BORROWER)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${activeRole === UserRole.BORROWER ? 'bg-white dark:bg-[#1c2127] text-primary dark:text-white shadow-sm' : 'text-slate-500'
                }`}
            >
              Customer Login
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Please enter your credentials.</p>
          </div>
        </div>

        <form className="px-6 py-6 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <span className="text-white text-sm font-medium">Email Address</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-[#111418] border dark:border-[#3b4754] rounded-lg text-white"
                placeholder={activeRole === UserRole.ADMIN ? 'admin@loantracker.com' : 'bob@example.com'}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white text-sm font-medium">Password</span>
              <button type="button" className="text-primary text-sm font-medium">Forgot Password?</button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-12 bg-slate-50 dark:bg-[#111418] border dark:border-[#3b4754] rounded-lg text-white"
                placeholder="••••••••"
                required
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">visibility_off</button>
            </div>
          </div>

          <button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-all">
            Log In as {activeRole === UserRole.ADMIN ? 'Admin' : 'Customer'}
          </button>
        </form>

        <div className="px-6 pb-8 text-center">
          <p className="text-slate-400 text-sm">
            Need help? <button className="text-primary font-bold">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
