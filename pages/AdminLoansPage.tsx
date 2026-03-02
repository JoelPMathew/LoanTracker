import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../client-api/axios';
import { useNavigate } from 'react-router-dom';

const AdminLoansPage: React.FC = () => {
    const [loans, setLoans] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/loans').then(res => setLoans(res.data)).catch(console.error);
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.put(`/loans/${id}`, { status });
            // Refresh
            const res = await api.get('/loans');
            setLoans(res.data);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const sidebarItems = [
        { id: 'home', label: 'Overview', icon: 'dashboard', path: '/admin' },
        { id: 'loans', label: 'Loans', icon: 'account_balance', path: '/admin/loans' },
        { id: 'users', label: 'Users', icon: 'group', path: '/admin/users' },
        { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' },
    ];

    return (
        <Layout sidebarItems={sidebarItems}>
            <header className="px-6 py-4 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white">All Loans</h1>
            </header>
            <div className="p-6">
                <div className="bg-surface-dark border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                                <th className="px-6 py-4">Borrower</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loans.map(loan => (
                                <tr key={loan._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">
                                        {(loan.borrowerId as any)?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {(loan.typeId as any)?.name || 'Custom'}
                                    </td>
                                    <td className="px-6 py-4 text-white font-mono font-bold">
                                        ${loan.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${loan.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                                                loan.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-slate-500/10 text-slate-500'
                                            }`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {loan.status === 'PENDING' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleStatusUpdate(loan._id, 'REJECTED')} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20">
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                                <button onClick={() => handleStatusUpdate(loan._id, 'ACTIVE')} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20">
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                </button>
                                            </div>
                                        )}
                                        <button onClick={() => navigate(`/loan/${loan._id}`)} className="text-xs text-primary font-bold hover:underline ml-2">Detail</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminLoansPage;
