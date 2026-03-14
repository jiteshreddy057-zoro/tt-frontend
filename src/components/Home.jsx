import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse animation-delay-2000"></div>
            </div>
            <div className="relative z-10 text-center space-y-6">
                <div className="inline-block px-6 py-2 rounded-full border border-cyan-500/30 bg-cyan-900/30 text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    Welcome to the Future of Privacy
                </div>
                <h1 className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 pb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 relative text-glow glow-text-intense">
                    PRIVACY-FORGE AI
                    <div className="absolute -inset-1 blur-3xl opacity-40 bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 z-[-1] animate-pulse"></div>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 text-shadow-sm">
                    Secure On-Device Workspace. Experience WebAssembly-powered OCR and Translation running entirely local in your browser.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
                <FeatureCard
                    title="Camera Translate"
                    desc="Real-time OCR + Translation. Point your camera, get instant results."
                    icon="📸"
                    to="/camera"
                />
                <FeatureCard
                    title="AI-Powered Translator"
                    desc="Translate text with AI refinement and grammar analysis by Gemini."
                    icon="🌐"
                    to="/translator"
                />
                <FeatureCard
                    title="AI Summarize & Refine"
                    desc="Summarize documents and refine translations with Google Gemini AI."
                    icon="🧠"
                    to="/translator"
                />
                <FeatureCard
                    title="Language Trivia"
                    desc="Explore fascinating and obscure facts about world languages."
                    icon="✨"
                    to="/interesting"
                />
            </div>
            <Link to="/translator" className="mt-16 px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)] hover:scale-105 transition-all active:scale-95 duration-300 z-10 relative overflow-hidden group border border-cyan-400/50">
                <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                <span className="relative z-10 flex items-center gap-3">
                    Activate Terminal <span className="group-hover:translate-x-2 transition-transform duration-300 font-mono">_&gt;</span>
                </span>
            </Link>
        </div>
    );
};
const FeatureCard = ({ title, desc, icon, to }) => (
    <Link to={to} className="group p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 text-left relative overflow-hidden animate-in fade-in zoom-in duration-700 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none group-hover:opacity-100 opacity-50"></div>
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-600/50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-inner group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            {icon}
        </div>
        <h3 className="text-xl font-black mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-fuchsia-400 transition-all duration-300 relative z-10">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10 group-hover:text-slate-300 transition-colors">{desc}</p>
    </Link>
);
export default Home;

