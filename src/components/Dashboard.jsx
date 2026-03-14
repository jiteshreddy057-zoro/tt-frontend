import React, { useEffect, useState, useCallback } from 'react';
import { getHistory } from '../services/api';
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};
const typeIcon = {
    TRANSLATE: '🌐',
    OCR: '📄',
    VOICE: '🎙️',
    CAMERA: '📸',
};
const ProfileCard = ({ username }) => {
    const joined = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const initial = username.charAt(0).toUpperCase();
    return (
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl shadow-blue-500/30">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-4xl font-black shadow-xl flex-shrink-0">
                    {initial}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Logged in as</p>
                    <h2 className="text-2xl font-black truncate">{username}</h2>
                    <p className="text-sm text-white/70 mt-0.5">Member since {joined}</p>
                </div>
                <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex-shrink-0">
                    <span className="text-2xl font-black">AI</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 mt-0.5">Console</span>
                </div>
            </div>
            <div className="relative mt-8 grid grid-cols-2 gap-4">
                {[
                    { label: 'Translations', icon: '🌐' },
                    { label: 'OCR Scans', icon: '📄' },
                ].map(({ label, icon }) => (
                    <div key={label} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
                        <p className="text-xl mb-1">{icon}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
const RecentTranslations = ({ entries, loading }) => (
    <div className="bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
                <h3 className="font-black text-lg">Recent Translations</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your latest activity</p>
            </div>
            <span className="text-2xl">⚡</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                    </div>
                ))
            ) : entries.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm font-semibold">No history yet</p>
                    <p className="text-xs mt-1">Start translating to see your activity here</p>
                </div>
            ) : (
                entries.slice(0, 8).map((entry, i) => (
                    <div key={entry.id ?? i}
                        className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                            {typeIcon[entry.type] ?? '💬'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate dark:text-slate-200">{entry.sourceText || '—'}</p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{entry.resultText || '—'}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                ${entry.type === 'TRANSLATE' ? 'bg-blue-500/10 text-blue-500'
                                    : entry.type === 'OCR' ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-purple-500/10 text-purple-500'}`}>
                                {entry.type}
                            </span>
                            {entry.createdAt && (
                                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(entry.createdAt)}</p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
const DownloadedPacks = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const loadCache = useCallback(async () => {
        setLoading(true);
        if (!('caches' in window)) { setLoading(false); return; }
        try {
            const keys = await caches.keys();
            const list = [];
            for (const key of keys) {
                const cache = await caches.open(key);
                const requests = await cache.keys();
                for (const req of requests) {
                    const url = req.url;
                    const parts = url.split('/');
                    const filename = parts[parts.length - 1] || url;
                    list.push({ url, label: filename });
                }
            }
            setFiles(list);
        } catch { } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { loadCache(); }, [loadCache]);
    const handleClear = async () => {
        if (!window.confirm('Delete all cached model files? You will need to re-download them.')) return;
        setClearing(true);
        const keys = await caches.keys();
        for (const key of keys) await caches.delete(key);
        await loadCache();
        setClearing(false);
    };
    const modelMap = {};
    for (const f of files) {
        try {
            const path = new URL(f.url).pathname.split('/').filter(Boolean);
            const bucket = path[0] ?? 'other';
            if (!modelMap[bucket]) modelMap[bucket] = [];
            modelMap[bucket].push(f);
        } catch {
            if (!modelMap['other']) modelMap['other'] = [];
            modelMap['other'].push(f);
        }
    }
    return (
        <div className="bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-lg">Downloaded Language Packs</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {loading ? 'Loading cache…' : `${files.length} file${files.length !== 1 ? 's' : ''} in browser cache`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadCache}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 transition-colors text-sm"
                        title="Refresh"
                    >🔄</button>
                    {files.length > 0 && (
                        <button
                            onClick={handleClear}
                            disabled={clearing}
                            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            {clearing ? 'Clearing…' : 'Clear All'}
                        </button>
                    )}
                </div>
            </div>
            <div className="p-6">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : files.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                        <p className="text-4xl mb-3">📦</p>
                        <p className="text-sm font-semibold">No models cached yet</p>
                        <p className="text-xs mt-1">Run a translation to download the AI model</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(modelMap).map(([bucket, items]) => (
                            <div key={bucket}
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg">💾</span>
                                    <p className="text-sm font-bold truncate flex-1">{bucket}</p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                        {items.length} file{items.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="max-h-28 overflow-y-auto space-y-1 pl-9">
                                    {items.map((f, i) => (
                                        <p key={i} className="text-[10px] text-slate-400 truncate font-mono">{f.label}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
const Dashboard = () => {
    const username = localStorage.getItem('username') || 'Guest';
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    useEffect(() => {
        if (username === 'Guest') { setHistoryLoading(false); return; }
        getHistory(username)
            .then((data) => setHistory(Array.isArray(data) ? data.reverse() : []))
            .catch(() => setHistory([]))
            .finally(() => setHistoryLoading(false));
    }, [username]);
    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-slate-400 mt-1">Welcome back, <span className="font-semibold text-slate-600 dark:text-slate-300">{username}</span></p>
            </div>
            <ProfileCard username={username} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentTranslations entries={history} loading={historyLoading} />
                <DownloadedPacks />
            </div>
        </div>
    );
};
export default Dashboard;

