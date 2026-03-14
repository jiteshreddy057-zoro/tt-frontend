import React, { useState, useEffect, useRef } from 'react';
import { languages } from '../constants/languages';
import { saveHistory } from '../services/api';
const Translator = () => {
    const [mode, setMode] = useState('text-to-text');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [srcLang, setSrcLang] = useState('en');
    const [tgtLang, setTgtLang] = useState('fr');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState(null);
    const worker = useRef(null);
    const recognition = useRef(null);
    const synthesis = useRef(window.speechSynthesis);
    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
        }
        const onMessage = (e) => {
            const { status, output, error } = e.data;
            if (status === 'initiate') {
                setIsLoading(true);
            } else if (status === 'progress') {
                setProgress(e.data);
            } else if (status === 'complete') {
                setIsLoading(false);
                const translated = output[0].translation_text;
                setOutputText(translated);
                setProgress(null);
                if (mode === 'text-to-speech' || mode === 'speech-to-speech') {
                    speak(translated, tgtLang);
                }
                const username = localStorage.getItem('username') || 'Guest';
                saveHistory({
                    username,
                    type: mode.toUpperCase().replace(/-/g, '_'),
                    sourceText: inputText,
                    resultText: translated
                }).catch(() => {});
            } else if (status === 'error') {
                setIsLoading(false);
                setError(error);
                console.error('Translation Error:', error);
            }
        };
        worker.current.addEventListener('message', onMessage);
        return () => worker.current?.removeEventListener('message', onMessage);
    }, [mode, inputText, tgtLang]);
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsRecording(false);
            };
            recognition.current.onerror = () => setIsRecording(false);
            recognition.current.onend = () => setIsRecording(false);
        }
    }, []);
    const speak = (text, langCode) => {
        if (!synthesis.current) return;
        synthesis.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synthesis.current.getVoices();
        const langShort = langCode.split('_')[0];
        const voice = voices.find(v => v.lang.startsWith(langShort));
        if (voice) utterance.voice = voice;
        synthesis.current.speak(utterance);
    };
    const handleTranslate = () => {
        if (!worker.current || !inputText.trim()) return;
        setIsLoading(true);
        setError(null);
        setOutputText('');
        worker.current.postMessage({
            text: inputText,
            src_lang: srcLang,
            tgt_lang: tgtLang
        });
    };
    const toggleRecording = () => {
        if (isRecording) {
            recognition.current?.stop();
        } else {
            setInputText('');
            recognition.current.lang = srcLang.split('_')[0];
            recognition.current?.start();
            setIsRecording(true);
        }
    };
    const modes = [
        { id: 'text-to-text', label: 'Text', icon: '📝' },
        { id: 'text-to-speech', label: 'Listen', icon: '🔊' },
        { id: 'speech-to-text', label: 'Dictate', icon: '🎙️' },
        { id: 'speech-to-speech', label: 'Voice Pass', icon: '🗣️' },
    ];
    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="relative z-10 text-center space-y-4">
                <div className="inline-block px-6 py-2 glass-panel rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                    STAGE 1: MULTIMODAL INPUT
                </div>
                <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent pb-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                    PRIVACY-FORGE AI
                </h1>
                <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-base font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                    Secure On-Device Workspace. Switch seamlessly between text and voice modes. All translations are managed securely.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 relative z-10 animate-in fade-in zoom-in duration-700 delay-500">
                <div className="glass-panel p-2 rounded-3xl flex gap-2">
                    {modes.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm
                                ${mode === m.id 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105' 
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{m.icon}</span>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-center group relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
                <div className="glass-panel p-3 rounded-3xl flex items-center gap-4">
                    <select value={srcLang} onChange={(e) => setSrcLang(e.target.value)}
                        className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-blue-500/30 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all">
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 group-hover:rotate-180 transition-transform duration-500">⇄</div>
                    <select value={tgtLang} onChange={(e) => setTgtLang(e.target.value)}
                        className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-blue-500/30 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all">
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 animate-in slide-in-from-bottom-8 duration-1000 delay-1000">
                <div className="space-y-4">
                    <div className="relative group">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isRecording ? "Listening..." : "Enter text to translate..."}
                            className={`w-full h-80 p-8 glass-card rounded-[32px] outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none text-lg leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500
                                ${isRecording ? 'animate-pulse ring-4 ring-red-500/40 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : ''}`}
                        />
                        {(mode === 'speech-to-text' || mode === 'speech-to-speech') && (
                            <button
                                onClick={toggleRecording}
                                className={`absolute bottom-8 right-8 w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-all shadow-xl hover:scale-110 active:scale-95 border border-white/20
                                    ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'glass hover:bg-white/80 dark:hover:bg-slate-700/80 text-blue-600 dark:text-blue-400'}`}
                            >
                                {isRecording ? '⏹️' : '🎙️'}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !inputText.trim()}
                        className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[32px] font-black shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-4 text-lg relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center gap-4">
                            {isLoading ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    <span>STAGE 2 & 3: EDGE ISOLATION...</span>
                                </>
                            ) : (
                                <>
                                    <span>Translate & Run</span>
                                    <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">🚀</span>
                                </>
                            )}
                        </span>
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="relative h-80 p-8 glass-card rounded-[32px] flex flex-col overflow-auto z-10">
                        {isLoading && progress && (
                            <div className="absolute inset-0 glass-panel flex flex-col items-center justify-center p-10 z-20 animate-in fade-in zoom-in rounded-[32px]">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center text-5xl mb-8 border border-white/20 animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.3)]">⚙️</div>
                                <p className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 tracking-widest uppercase mb-4 text-glow">Optimizing WebAssembly</p>
                                <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden border border-white/10">
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.8)]" style={{ width: `${progress.progress * 100}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 font-mono">Loading: {progress.file}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Result Console</h3>
                            {outputText && (
                                <button onClick={() => speak(outputText, tgtLang)} className="p-3 glass hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-xl transition-all shadow-md group border border-white/30"><span className="group-hover:scale-125 transition-transform block">🔊</span></button>
                            )}
                        </div>
                        {error && (
                            <div className="absolute inset-x-0 top-0 mt-4 mx-4 p-4 glass border-red-500/30 rounded-2xl text-red-500 text-sm font-bold animate-in slide-in-from-top-4 z-30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                ⚠️ {error}
                                <p className="mt-1 text-xs font-normal opacity-70">Translation models are large. Try checking your network.</p>
                            </div>
                        )}
                        {outputText ? (
                            <p className="text-2xl leading-relaxed font-semibold animate-in slide-in-from-bottom-6 text-slate-800 dark:text-slate-100">
                                {outputText}
                            </p>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
                                <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center text-5xl mb-2 opacity-50"><span className="animate-pulse">🌍</span></div>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Awaiting Input</p>
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-blue-500/10 rounded-[24px] flex items-start gap-4 shadow-inner">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">🧞‍♂️</div>
                        <div>
                            <h4 className="font-black text-xs uppercase tracking-wider mb-1">Did you know?</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                You can use the "Voice Pass" mode for a walkie-talkie style experience. Just tap to speak, and let the AI handle the rest!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Translator;

