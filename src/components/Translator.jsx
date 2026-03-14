import React, { useEffect, useRef, useState } from 'react';
import { saveHistory } from '../services/api';
import culturalEngine from '../services/CulturalEngine';

const Translator = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [srcLang, setSrcLang] = useState('eng_Latn');
    const [tgtLang, setTgtLang] = useState('fra_Latn');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [culturalTips, setCulturalTips] = useState([]);
    const [toneAnalysis, setToneAnalysis] = useState('');
    const worker = useRef(null);
    const inputTextRef = useRef('');
    useEffect(() => {
        inputTextRef.current = inputText;
    }, [inputText]);
    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../worker.ts', import.meta.url), {
                type: 'module',
            });
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
                setCulturalTips(culturalEngine.getTips(tgtLang));
                setToneAnalysis(culturalEngine.analyzeTone(translated));
                setProgress(null);
                const username = localStorage.getItem('username') || 'anonymous';
                saveHistory({
                    username,
                    type: 'TRANSLATE',
                    sourceText: inputTextRef.current,
                    resultText: translated
                }).catch(err => console.error('History save failed', err));
            } else if (status === 'error') {
                console.error(error);
                setIsLoading(false);
                alert("Translation failed: " + error);
            }
        };
        worker.current.addEventListener('message', onMessage);
        return () => worker.current?.removeEventListener('message', onMessage);
    }, []);
    const handleTranslate = () => {
        if (!worker.current) return;
        setIsLoading(true);
        setOutputText('');
        worker.current.postMessage({
            text: inputText,
            src_lang: srcLang,
            tgt_lang: tgtLang,
        });
    };
    const swapLanguages = () => {
        setSrcLang(tgtLang);
        setTgtLang(srcLang);
        setInputText(outputText);
        setOutputText(inputText);
    };
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    STAGE 2 & 3: EDGE ISOLATION & TRANSLATION
                </h1>
                <p className="text-slate-500 dark:text-slate-400">High-performance offline translation powered by AI</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Source Language</label>
                    <select
                        value={srcLang}
                        onChange={(e) => setSrcLang(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                    >
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
                <button
                    onClick={swapLanguages}
                    className="p-3 mt-6 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-all transform hover:rotate-180"
                    title="Swap Languages"
                >
                    ⇄
                </button>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Target Language</label>
                    <select
                        value={tgtLang}
                        onChange={(e) => setTgtLang(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                    >
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="relative group">
                        <textarea
                            className="w-full h-64 p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            placeholder="Start typing or paste text here..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <div className="absolute bottom-6 right-6 flex items-center gap-2">
                            <span className="text-xs text-slate-400">{inputText.length} characters</span>
                        </div>
                    </div>
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !inputText.trim()}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span>Translate</span>
                                <span className="text-lg">→</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="relative h-64 p-6 bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col overflow-auto">
                        {isLoading && progress && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 rounded-3xl animate-in fade-in zoom-in">
                                <p className="text-sm font-bold text-blue-500 mb-4 animate-bounce">PROCESSING ON DEVICE...</p>
                                <div className="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-2">
                                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50" style={{ width: `${progress.progress}%` }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Optimizing: {progress.file}</p>
                            </div>
                        )}
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 ml-1">Translation Result</h3>
                        {outputText ? (
                            <p className="text-lg leading-relaxed dark:text-slate-200 animate-in slide-in-from-bottom-2">
                                {outputText}
                            </p>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-50">
                                <span className="text-4xl">📄</span>
                                <p className="text-sm">Translation will appear here</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Cultural Compass Panel */}
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-700">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Cultural Compass</h3>
                            {toneAnalysis && (
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-full uppercase border border-blue-500/20">
                                    Tone: {toneAnalysis}
                                </span>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {culturalTips.length > 0 ? (
                                culturalTips.map((tip, i) => (
                                    <div key={i} className="group p-5 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-lg hover:border-blue-500/30 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🧭</div>
                                            <div>
                                                <h4 className="font-black text-sm mb-1">{tip.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                    {tip.advice}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] text-center opacity-40">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insights will appear after translation</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Translator;

