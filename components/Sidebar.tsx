import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItem {
    id: string;
    label: string;
    icon: string;
    path: string;
}

interface SidebarProps {
    items: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-surface-dark border-r border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="text-primary flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <span className="material-symbols-outlined text-primary text-[28px]">account_balance_wallet</span>
                </div>
                <h1 className="text-white text-xl font-bold tracking-tight">LoanTracker</h1>
            </div>

            <nav className="space-y-2 flex-1">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-slate-800">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/');
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
