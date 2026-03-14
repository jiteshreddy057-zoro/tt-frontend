import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
            </div>
            <h1 className="text-6xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Precision
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
                Experience the future of text interaction. High-performance OCR, real-time translation—all running locally in your browser.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
                <FeatureCard
                    title="Camera Translate"
                    desc="Real-time OCR + Translation. Point your camera, get instant results."
                    icon="📸"
                    to="/camera"
                />
                <FeatureCard
                    title="Neural Translator"
                    desc="Advanced cloud-powered multilingual translation."
                    icon="🌐"
                    to="/translator"
                />
                <FeatureCard
                    title="Instant OCR"
                    desc="Extract text from any document with ease."
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
            <Link to="/translator" className="mt-12 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-105 transition-all active:scale-95">
                Get Started Now
            </Link>
        </div>
    );
};
const FeatureCard = ({ title, desc, icon, to }) => (
    <Link to={to} className="group p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </Link>
);
export default Home;

