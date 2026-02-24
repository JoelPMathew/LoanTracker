
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, UserRole } from '../types';
import api from '../api/axios';

interface SignUpPageProps {
  onLogin: (user: User) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('BORROWER');
  const [adminSecret, setAdminSecret] = useState('');

  const [validationErrors, setValidationErrors] = useState<{ email?: string, password?: string }>({});

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Must contain an uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Must contain a number';
    return '';
  };

  const validateEmail = (mail: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(mail) ? '' : 'Invalid email format';
  };

  const calculateStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length > 7) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength; // 0-4
  };

  const strength = calculateStrength(password);
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(password);
    const emailError = validateEmail(email);

    if (pwdError || emailError) {
      setValidationErrors({ email: emailError, password: pwdError });
      return;
    }

    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        ...(role === 'ADMIN' && { adminSecret })
      });
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Layout>
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-white text-lg font-bold flex-1 text-center pr-10">Sign Up</h2>
      </div>

      <div className="px-4 py-6 space-y-2">
        <h1 className="text-white text-3xl font-bold">Create Account</h1>
        <p className="text-slate-400">Start tracking your loans efficiently today.</p>

        {/* Role Selection */}
        <div className="flex bg-[#1c2127] p-1 rounded-xl mt-4 border border-slate-700">
          <button
            type="button"
            onClick={() => setRole('BORROWER')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'BORROWER' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Join as Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'ADMIN' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Join as Admin
          </button>
        </div>
      </div>

      <form className="px-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-white font-medium text-sm">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-14 bg-[#1c2127] border border-slate-700 rounded-xl text-white px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-white font-medium text-sm">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidationErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
            }}
            className={`w-full h-14 bg-[#1c2127] border ${validationErrors.email ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
          />
          {validationErrors.email && <p className="text-red-500 text-xs">{validationErrors.email}</p>}
        </div>

        {role === 'ADMIN' && (
          <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
            <label className="text-white font-medium text-sm">Admin Secret Key</label>
            <input
              type="password"
              placeholder="Enter admin secret key"
              required
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full h-14 bg-[#1c2127] border border-amber-500/50 rounded-xl text-white px-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-amber-500/80 text-xs">Required for admin registration.</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-white font-medium text-sm">Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Create a password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
              }}
              className={`w-full h-14 bg-[#1c2127] border ${validationErrors.password ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <span className="material-symbols-outlined">visibility_off</span>
            </button>
          </div>
          {/* Strength Meter */}
          <div className="flex gap-1 h-1 mt-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`flex-1 rounded-full ${i < strength ? strengthColor[strength] : 'bg-slate-800'} transition-all text-[0px]`}>.</div>
            ))}
          </div>
          {validationErrors.password && <p className="text-red-500 text-xs">{validationErrors.password}</p>}
          <p className="text-slate-500 text-xs">Must be 8+ chars, include uppercase & number.</p>
        </div>

        <div className="flex items-start gap-3 py-2">
          <input type="checkbox" required className="mt-1 bg-[#1c2127] border-slate-700 rounded text-primary focus:ring-primary" id="terms" />
          <label htmlFor="terms" className="text-sm text-slate-400 leading-tight">
            I agree to the <button type="button" className="text-primary font-medium hover:underline">Terms of Service</button> and <button type="button" className="text-primary font-medium hover:underline">Privacy Policy</button>.
          </label>
        </div>

        <button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform">
          Create Account
        </button>
      </form>

      <div className="flex items-center gap-4 px-4 py-8">
        <div className="h-px flex-1 bg-slate-800"></div>
        <span className="text-slate-500 text-sm">Or continue with</span>
        <div className="h-px flex-1 bg-slate-800"></div>
      </div>

      <div className="px-4 space-y-3 pb-8">
        <button type="button" className="w-full h-12 bg-[#1c2127] border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-white hover:bg-slate-800 transition-colors">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
        <button type="button" className="w-full h-12 bg-[#1c2127] border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-white hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">apple</span>
          Continue with Apple
        </button>

        <div className="text-center pt-6">
          <p className="text-slate-400">
            Already have an account? <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Log in</button>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage;
