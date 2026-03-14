import React, { useState, useEffect, useRef } from 'react';
import { languages } from '../constants/languages';
import { saveHistory } from '../services/api';
import { refineTranslation, summarizeText } from '../services/geminiService';
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
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
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
    const handleRefine = async () => {
        if (!outputText || !inputText) return;
        setAiLoading(true);
        setAiError(null);
        setAiResponse('');
        try {
            const srcName = languages.find(l => l.code === srcLang)?.name || srcLang;
            const tgtName = languages.find(l => l.code === tgtLang)?.name || tgtLang;
            const result = await refineTranslation({
                sourceText: inputText,
                translatedText: outputText,
                sourceLang: srcName,
                targetLang: tgtName
            });
            setAiResponse(result);
        } catch (err) {
            setAiError(err.message || 'AI refinement failed.');
        } finally {
            setAiLoading(false);
        }
    };
    const handleSummarize = async () => {
        if (!inputText.trim()) return;
        setAiLoading(true);
        setAiError(null);
        setAiResponse('');
        try {
            const result = await summarizeText(inputText);
            setAiResponse(result);
        } catch (err) {
            setAiError(err.message || 'AI summarization failed.');
        } finally {
            setAiLoading(false);
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
                <div className="inline-block px-6 py-2 rounded-full border border-cyan-500/30 bg-cyan-900/30 text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    STAGE 1: MULTIMODAL INPUT
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 pb-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 text-glow glow-text-intense">
                    PRIVACY-FORGE AI
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-base font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 text-shadow-sm">
                    Secure On-Device Workspace. Switch seamlessly between text and voice modes. All translations are managed securely.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 relative z-10 animate-in fade-in zoom-in duration-700 delay-500">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-2 rounded-3xl flex gap-2 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                    {modes.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm border
                                ${mode === m.id 
                                    ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] border-cyan-400/50 scale-105' 
                                    : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5 border-transparent'}`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{m.icon}</span>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-center group relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-3 rounded-3xl flex items-center gap-4 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
                    <select value={srcLang} onChange={(e) => setSrcLang(e.target.value)}
                        className="p-3 bg-slate-800/50 text-slate-200 rounded-xl border border-transparent hover:border-cyan-500/50 font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer transition-all">
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(217,70,239,0.5)] group-hover:rotate-180 transition-transform duration-500">⇄</div>
                    <select value={tgtLang} onChange={(e) => setTgtLang(e.target.value)}
                        className="p-3 bg-slate-800/50 text-slate-200 rounded-xl border border-transparent hover:border-cyan-500/50 font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer transition-all">
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
                            className={`w-full h-80 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all resize-none text-lg leading-relaxed placeholder:text-slate-500 text-slate-200
                                ${isRecording ? 'animate-pulse ring-2 ring-fuchsia-500/50 border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.3)]' : 'shadow-[0_0_30px_rgba(34,211,238,0.05)]'}`}
                        />
                        {(mode === 'speech-to-text' || mode === 'speech-to-speech') && (
                            <button
                                onClick={toggleRecording}
                                className={`absolute bottom-8 right-8 w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-all shadow-xl hover:scale-110 active:scale-95 border
                                    ${isRecording ? 'bg-fuchsia-500 text-white animate-pulse border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.5)]' : 'bg-slate-800 border-slate-600 hover:border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'}`}
                            >
                                {isRecording ? '⏹️' : '🎙️'}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !inputText.trim()}
                        className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-[32px] font-black shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)] hover:-translate-y-1 active:translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-4 text-lg relative overflow-hidden group border border-cyan-400/50"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center gap-4">
                            {isLoading ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                                    <span className="tracking-widest filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">EDGE ISOLATION ACTIVE...</span>
                                </>
                            ) : (
                                <>
                                    <span>Execute Translation</span>
                                    <span className="text-xl group-hover:translate-x-2 transition-transform duration-300 font-mono">_&gt;</span>
                                </>
                            )}
                        </span>
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="relative h-80 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] flex flex-col overflow-auto z-10 shadow-[0_0_30px_rgba(217,70,239,0.05)]">
                        {isLoading && progress && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-10 z-20 animate-in fade-in zoom-in rounded-[32px]">
                                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 rounded-full flex items-center justify-center text-5xl mb-8 border border-white/10 animate-pulse shadow-[0_0_40px_rgba(34,211,238,0.4)]">⚙️</div>
                                <p className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 tracking-widest uppercase mb-4 text-glow">Optimizing WebAssembly</p>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                                    <div className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-full transition-all duration-300 shadow-[0_0_20px_rgba(217,70,239,0.8)]" style={{ width: `${progress.progress * 100}%` }} />
                                </div>
                                <p className="text-[10px] text-cyan-500/70 mt-3 font-mono">Loading: {progress.file}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Result Console</h3>
                            {outputText && (
                                <button onClick={() => speak(outputText, tgtLang)} className="p-3 bg-slate-800 border border-slate-600 hover:border-cyan-400 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] group"><span className="group-hover:scale-125 transition-transform block filter group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">🔊</span></button>
                            )}
                        </div>
                        {error && (
                            <div className="absolute inset-x-0 top-0 mt-4 mx-4 p-4 bg-slate-900/90 border border-red-500/50 rounded-2xl text-red-400 text-sm font-bold animate-in slide-in-from-top-4 z-30 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                ⚠️ {error}
                                <p className="mt-1 text-xs font-normal opacity-70">Translation models are large. Try checking your network.</p>
                            </div>
                        )}
                        {outputText ? (
                            <p className="text-2xl leading-relaxed font-semibold animate-in slide-in-from-bottom-6 text-white text-shadow-sm">
                                {outputText}
                            </p>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                                <div className="w-24 h-24 rounded-full border border-slate-700/50 bg-slate-800/30 flex items-center justify-center text-5xl mb-2 opacity-50"><span className="animate-pulse filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🌍</span></div>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Awaiting Input</p>
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-gradient-to-br from-cyan-900/40 to-fuchsia-900/40 border border-cyan-500/30 rounded-[24px] flex items-start gap-4 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                        <div className="w-12 h-12 bg-slate-900 border border-cyan-500/50 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(34,211,238,0.3)] flex-shrink-0">🧞‍♂️</div>
                        <div>
                            <h4 className="font-black text-xs uppercase tracking-wider mb-1 text-cyan-400">Did you know?</h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                You can use the "Voice Pass" mode for a walkie-talkie style experience. Just tap to speak, and let the AI handle the rest!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Feature Buttons */}
            <div className="flex flex-wrap gap-4 relative z-10 animate-in fade-in duration-500">
                <button
                    onClick={handleSummarize}
                    disabled={aiLoading || !inputText.trim()}
                    className="flex-1 min-w-[200px] py-4 bg-gradient-to-r from-fuchsia-600/80 to-purple-600/80 text-white rounded-2xl font-black shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:shadow-[0_0_50px_rgba(217,70,239,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:transform-none flex items-center justify-center gap-3 text-sm border border-fuchsia-400/50"
                >
                    {aiLoading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="text-lg">📋</span>
                    )}
                    AI Summarize
                </button>
                <button
                    onClick={handleRefine}
                    disabled={aiLoading || !outputText}
                    className="flex-1 min-w-[200px] py-4 bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 text-white rounded-2xl font-black shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:transform-none flex items-center justify-center gap-3 text-sm border border-cyan-400/50"
                >
                    {aiLoading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="text-lg">🤖</span>
                    )}
                    Refine with AI
                </button>
            </div>

            {/* AI Response Panel */}
            {(aiResponse || aiLoading || aiError) && (
                <div className="relative z-10 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="p-8 bg-slate-900/90 backdrop-blur-2xl border border-fuchsia-500/40 rounded-[32px] shadow-[0_0_50px_rgba(217,70,239,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-500"></div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-fuchsia-600/10 to-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-2xl flex items-center justify-center text-xl shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                                {aiLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : '🧠'}
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Gemini AI Analysis</h3>
                                <p className="text-[10px] text-slate-500 font-medium">Powered by Google Gemini 2.0 Flash</p>
                            </div>
                        </div>

                        {aiLoading && (
                            <div className="flex items-center gap-4 py-8">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <p className="text-sm text-fuchsia-400 font-bold tracking-wider animate-pulse">AI is thinking...</p>
                            </div>
                        )}

                        {aiError && (
                            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-2xl text-red-400 text-sm font-bold">
                                ⚠️ {aiError}
                            </div>
                        )}

                        {aiResponse && (
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed
                                prose-strong:text-cyan-400 prose-h1:text-fuchsia-400 prose-h2:text-fuchsia-400 prose-h3:text-fuchsia-400
                                prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:marker:text-fuchsia-400
                                prose-code:text-cyan-300 prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                                whitespace-pre-wrap">
                                {aiResponse}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default Translator;

