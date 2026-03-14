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
            <div className="text-center space-y-3">
                <div className="inline-block px-4 py-1.5 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-blue-600/10">
                    Neural Multimodal Engine
                </div>
                <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 dark:from-white dark:via-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
                    Unified Translator
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm font-medium">
                    Switch seamlessly between text and voice modes. All translations are performed locally for maximum privacy.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`px-6 py-3.5 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm shadow-xl
                            ${mode === m.id 
                                ? 'bg-blue-600 text-white shadow-blue-500/30 scale-105' 
                                : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-700'}`}
                    >
                        <span className="text-xl">{m.icon}</span>
                        {m.label}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 px-4">
                    <select value={srcLang} onChange={(e) => setSrcLang(e.target.value)}
                        className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 font-bold">→</div>
                    <select value={tgtLang} onChange={(e) => setTgtLang(e.target.value)}
                        className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="relative group">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isRecording ? "Listening..." : "Enter text to translate..."}
                            className={`w-full h-80 p-8 bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-lg leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-600
                                ${isRecording ? 'animate-pulse ring-4 ring-red-500/20 border-red-500/30' : ''}`}
                        />
                        {(mode === 'speech-to-text' || mode === 'speech-to-speech') && (
                            <button
                                onClick={toggleRecording}
                                className={`absolute bottom-6 right-6 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-xl
                                    ${isRecording ? 'bg-red-500 text-white animate-bounce' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-blue-600'}`}
                            >
                                {isRecording ? '⏹️' : '🎙️'}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !inputText.trim()}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-lg"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Neural Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Translate & Run</span>
                                <span className="text-xl">🚀</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="relative h-80 p-8 bg-slate-900/5 dark:bg-white/5 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col overflow-auto backdrop-blur-sm">
                        {isLoading && progress && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center p-10 z-20 animate-in fade-in">
                                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-4xl mb-6 animate-spin">⚙️</div>
                                <p className="text-xs font-black text-blue-600 tracking-widest uppercase mb-4">Optimizing Model Weights</p>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${progress.progress * 100}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-mono">Loading: {progress.file}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Result Console</h3>
                            {outputText && (
                                <button onClick={() => speak(outputText, tgtLang)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">🔊</button>
                            )}
                        </div>
                        {error && (
                            <div className="absolute inset-x-0 top-0 mt-4 mx-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold animate-in slide-in-from-top-4 z-30">
                                ⚠️ {error}
                                <p className="mt-1 font-normal opacity-70">Tip: Translation models are large. Try refreshing or using a faster connection.</p>
                            </div>
                        )}
                        {outputText ? (
                            <p className="text-xl leading-relaxed font-medium animate-in slide-in-from-bottom-4">
                                {outputText}
                            </p>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4">
                                <span className="text-7xl opacity-20">🌍</span>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Awaiting Input</p>
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

