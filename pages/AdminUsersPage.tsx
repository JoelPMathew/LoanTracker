import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        api.get('/auth/users').then(res => setUsers(res.data)).catch(console.error);
    }, []);

    const sidebarItems = [
        { id: 'home', label: 'Overview', icon: 'dashboard', path: '/admin' },
        { id: 'loans', label: 'Loans', icon: 'account_balance', path: '/admin/loans' },
        { id: 'users', label: 'Users', icon: 'group', path: '/admin/users' },
        { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' },
    ];

    return (
        <Layout sidebarItems={sidebarItems}>
            <header className="px-6 py-4 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white">User Directory</h1>
            </header>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                        <div key={user._id} className="bg-surface-dark border border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:border-slate-700 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                {user.name[0]}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-white font-bold truncate">{user.name}</h3>
                                <p className="text-slate-500 text-xs truncate">{user.email}</p>
                                <span className="inline-block px-2 py-0.5 bg-slate-800 rounded-full text-[10px] text-slate-400 font-bold uppercase mt-1">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default AdminUsersPage;
