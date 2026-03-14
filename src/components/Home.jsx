import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
            </div>
            <div className="relative z-10 text-center space-y-6">
                <div className="inline-block px-6 py-2 glass-panel rounded-full text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Welcome to the Future of Privacy
                </div>
                <h1 className="text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent pb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 relative">
                    PRIVACY-FORGE AI
                    <div className="absolute -inset-1 blur-2xl opacity-30 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 z-[-1] animate-pulse"></div>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
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
                    title="STAGE 2 & 3: EDGE ISOLATION"
                    desc="Secure on-device translation pipeline."
                    icon="🌐"
                    to="/translator"
                />
                <FeatureCard
                    title="STAGE 2: EDGE ISOLATION (OCR)"
                    desc="Extract structured text locally with Tesseract.js."
                    icon="📄"
                    to="/ocr"
                />
                <FeatureCard
                    title="Language Learner"
                    desc="Duolingo-style AI lessons with flashcards, quizzes & speaking."
                    icon="🎓"
                    to="/learn"
                />
            </div>
            <Link to="/translator" className="mt-16 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] hover:scale-105 transition-all active:scale-95 duration-300 z-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                <span className="relative z-10 flex items-center gap-3">
                    Start Processing <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
            </Link>
        </div>
    );
};
const FeatureCard = ({ title, desc, icon, to }) => (
    <Link to={to} className="group p-8 rounded-3xl glass-card text-left relative overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
        <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-500 transition-all duration-300 relative z-10">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium relative z-10">{desc}</p>
    </Link>
);
export default Home;

