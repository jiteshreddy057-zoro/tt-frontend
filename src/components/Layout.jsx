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
        { path: '/interesting', label: 'Interesting', icon: '✨' },
        { path: '/analyzer', label: 'Analyzer', icon: '🔬' },
        { path: '/memory', label: 'Memory', icon: '🧠' },
    ];
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 transition-colors duration-500 font-sans relative overflow-hidden">
            {/* Radiant Deep Space Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[150px] rounded-full animate-blob mix-blend-screen"></div>
                <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 blur-[150px] rounded-full animate-blob animation-delay-2000 mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[70%] h-[70%] bg-indigo-600/20 blur-[150px] rounded-full animate-blob animation-delay-4000 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px]"></div> {/* Deep Slate-950 Tint */}
            </div>

            <aside className={`relative flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 bg-slate-900/60 backdrop-blur-3xl border border-cyan-500/20 rounded-3xl transition-all duration-500 ease-in-out z-40 shadow-[0_0_50px_-12px_rgba(34,211,238,0.25)]
                ${collapsed ? 'w-20' : 'w-72'}`}>
                <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 shrink-0">
                        N
                    </div>
                    {!collapsed && (
                        <span className="ml-4 text-xl font-black tracking-tighter animate-in fade-in slide-in-from-left-4 duration-500">
                            PRIVACY-FORGE AI
                        </span>
                    )}
                </div>
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-500 group relative overflow-hidden
                                    ${isActive 
                                        ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-cyan-400/50' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400 border border-transparent'}
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
                    className="absolute -right-4 top-24 w-8 h-8 glass hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-full flex items-center justify-center shadow-lg transition-all z-50 group border border-white/50 dark:border-slate-600/50"
                >
                    <span className={`text-[10px] text-blue-600 dark:text-blue-400 group-hover:scale-125 transition-all duration-500 ${collapsed ? 'rotate-180' : ''}`}>
                        ◀
                    </span>
                </button>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-2 sm:p-4 lg:p-8 animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </div>
                <footer className="h-10 mx-4 mb-4 glass rounded-2xl px-6 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest overflow-hidden z-20">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2 group">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></span>
                            STAGE 5: SECURE SYNC & PERSISTENCE
                        </span>
                        <span className="hidden sm:inline">Secure On-Device Workspace</span>
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

