import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../client-api/axios';
import { User } from '../types';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        api.get('/auth/user')
            .then(res => setUser(res.data))
            .catch(console.error);
    }, []);

    if (!user) return <div className="p-8 text-white">Loading profile...</div>;

    return (
        <Layout>
            <header className="px-6 py-4 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white">My Profile</h1>
            </header>
            <div className="p-6 max-w-2xl">
                <div className="bg-surface-dark border border-slate-800 rounded-2xl p-8 flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-bold border-4 border-surface-dark shadow-xl">
                        {user.name[0]}
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-400 mt-2">
                                {user.role}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-800">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email Address</label>
                                <p className="text-white font-mono">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Member Since</label>
                                <p className="text-white">{new Date().toLocaleDateString()}</p>
                                {/* Timestamp not yet in user schema for client, using mock or need to update backend to send createdAt */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
