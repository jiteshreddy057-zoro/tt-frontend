import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const username = localStorage.getItem('username') || 'Guest';
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('username');
        navigate('/auth');
    };
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/camera', label: 'Camera', icon: '📸' },
        { path: '/translator', label: 'Translator', icon: '🌐' },
        { path: '/ocr', label: 'OCR', icon: '📄' },
        { path: '/models', label: 'Models', icon: '💾' },
        { path: '/learn', label: 'Learn', icon: '🎓' },
        { path: '/memory', label: 'Memory', icon: '🧠' },
    ];
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans">
            <aside className={`relative flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 ease-in-out shadow-2xl z-40
                ${collapsed ? 'w-20' : 'w-72'}`}>
                <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 shrink-0">
                        N
                    </div>
                    {!collapsed && (
                        <span className="ml-4 text-2xl font-black tracking-tighter animate-in fade-in slide-in-from-left-4 duration-500">
                            NEURA
                        </span>
                    )}
                </div>
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group relative
                                ${isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
                            `}
                        >
                            <span className="text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <span className="text-sm tracking-wide animate-in fade-in slide-in-from-left-2">
                                    {item.label}
                                </span>
                            )}
                            {collapsed && (
                                <div className="absolute left-20 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 font-bold uppercase tracking-widest border border-slate-700 shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
                    {!collapsed && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl mb-4 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Active Session</p>
                            <p className="text-sm font-bold truncate">{username}</p>
                        </div>
                    )}
                    <button 
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group
                            ${collapsed ? 'justify-center' : ''}`}
                        title="Sign Out"
                    >
                        <span className="text-xl shrink-0 group-hover:rotate-12 transition-transform">
                            🚪
                        </span>
                        {!collapsed && <span className="text-sm">Log Out</span>}
                    </button>
                </div>
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-4 top-24 w-8 h-8 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-50"
                >
                    <span className={`text-[10px] transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`}>
                        ◀
                    </span>
                </button>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-2 sm:p-4 lg:p-8 animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </div>
                <footer className="h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest overflow-hidden">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                            Neural System Active
                        </span>
                        <span className="hidden sm:inline">Build 1.0.4 - Premium Alpha</span>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <span>CPU Optimization Enabled</span>
                        <span>Local Inference Mode</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};
export default Layout;

