import React, { useState, useEffect, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { saveHistory } from '../services/api';
import { languages } from '../constants/languages';
import { preprocessImageForOCR, cleanOCRText } from '../utils/imagePreprocessing';
const CameraTranslator = () => {
    const [inputMode, setInputMode] = useState('camera');
    const [image, setImage] = useState(null);
    const [ocrText, setOcrText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [tgtLang, setTgtLang] = useState('fr');
    const [ocrProgress, setOcrProgress] = useState(0);
    const [transProgress, setTransProgress] = useState(null);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [camActive, setCamActive] = useState(false);
    const [camError, setCamError] = useState('');
    const [facingMode, setFacingMode] = useState('environment');
    const worker = useRef(null);
    const ocrRef = useRef('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);
    useEffect(() => { ocrRef.current = ocrText; }, [ocrText]);
    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
        }
        const onMsg = (e) => {
            const { status: s, output, error } = e.data;
            if (s === 'progress') {
                setTransProgress(e.data);
            } else if (s === 'complete') {
                const translated = output[0].translation_text;
                setTranslatedText(translated);
                setTransProgress(null);
                setIsLoading(false);
                setStatus('✅ Done');
                const username = localStorage.getItem('username') || 'anonymous';
                saveHistory({ username, type: 'CAMERA_TRANSLATE', sourceText: ocrRef.current, resultText: translated })
                    .catch(() => { });
            } else if (s === 'error') {
                setStatus('Translation error: ' + error);
                setIsLoading(false);
            }
        };
        worker.current.addEventListener('message', onMsg);
        return () => worker.current?.removeEventListener('message', onMsg);
    }, []);
    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCamActive(false);
    }, []);
    const startCamera = useCallback(async () => {
        setCamError('');
        stopCamera();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCamActive(true);
        } catch (err) {
            const msg = err?.name === 'NotAllowedError'
                ? 'Camera access denied. Please allow camera permissions in your browser settings.'
                : err?.name === 'NotFoundError'
                    ? 'No camera found on this device.'
                    : 'Could not open camera: ' + err?.message;
            setCamError(msg);
        }
    }, [facingMode, stopCamera]);
    useEffect(() => {
        if (camActive) startCamera();
    }, [facingMode]);
    useEffect(() => () => stopCamera(), [stopCamera]);
    useEffect(() => {
        if (inputMode === 'upload') stopCamera();
    }, [inputMode, stopCamera]);
    const captureFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setImage(dataUrl);
        setOcrText('');
        setTranslatedText('');
        setStatus('');
    }, []);
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
            setOcrText('');
            setTranslatedText('');
            setStatus('');
        }
    };
    const processImage = async () => {
        if (!image) return;
        setIsLoading(true);
        setOcrProgress(0);
        setTransProgress(null);
        setOcrText('');
        setTranslatedText('');
        try {
            setStatus('Optimising image…');
            const processed = await preprocessImageForOCR(image);
            setStatus('Extracting text (OCR)…');
            const result = await Tesseract.recognize(processed, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') setOcrProgress(m.progress * 100);
                    setStatus(m.status);
                },
            });
            const text = cleanOCRText(result.data.text);
            setOcrText(text);
            if (!text) {
                setStatus('No readable text found in image.');
                setIsLoading(false);
                return;
            }
            setStatus('Translating…');
            worker.current?.postMessage({ text, src_lang: 'en', tgt_lang: tgtLang });
        } catch (err) {
            setStatus('Error: ' + err);
            setIsLoading(false);
        }
    };
    const progressVal = ocrProgress || (transProgress?.progress * 100) || 0;
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700 pb-24 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-900/30 text-[10px] font-black uppercase tracking-widest text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        STAGE 1: MULTIMODAL INPUT
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 pb-1 text-glow glow-text-intense">
                        Camera Translator OCR
                    </h1>
                    <p className="text-slate-400 text-sm font-medium text-shadow-sm">Point camera → Extract text → Translate securely on-device</p>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl group hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-500/50 transition-all">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider ml-2 group-hover:text-blue-500 transition-colors">Translate to:</span>
                    <select value={tgtLang} onChange={e => setTgtLang(e.target.value)}
                        className="bg-transparent text-sm font-bold outline-none cursor-pointer pr-4 text-slate-800 dark:text-slate-100">
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-2 p-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-fit shadow-[0_0_30px_rgba(217,70,239,0.1)]">
                {['camera', 'upload'].map(m => (
                    <button key={m} onClick={() => setInputMode(m)}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 border ${inputMode === m
                            ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 shadow-[0_0_20px_rgba(34,211,238,0.5)] border-cyan-400/50 text-white scale-105'
                            : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5 border-transparent'}`}>
                        {m === 'camera' ? '📸 Live Camera' : '🖼️ Upload Image'}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                <div className="space-y-6">
                    {inputMode === 'camera' ? (
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] overflow-hidden group shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                            <div className="relative bg-slate-950 aspect-video w-full rounded-t-[32px] overflow-hidden">
                                <video ref={videoRef} autoPlay playsInline muted
                                    className={`w-full h-full object-cover transition-opacity duration-700 ${camActive ? 'opacity-100' : 'opacity-0'}`} />
                                <canvas ref={canvasRef} className="hidden" />
                                {!camActive && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white bg-slate-950/80 backdrop-blur-sm border-b border-cyan-500/20">
                                        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center text-4xl animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.2)]">📷</div>
                                        <p className="font-bold text-sm text-cyan-500/70 uppercase tracking-widest text-shadow-sm">Camera Module Offline</p>
                                    </div>
                                )}
                                {camActive && (
                                    <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
                                        className="absolute top-4 right-4 p-3 glass-panel rounded-2xl text-white text-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                                        title="Flip camera">
                                        🔄
                                    </button>
                                )}
                            </div>
                            <div className="p-6 flex gap-4 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50">
                                {!camActive ? (
                                    <button onClick={startCamera}
                                        className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg border border-cyan-400/50">
                                        <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">📷</span> Initialize Camera
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={captureFrame}
                                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg border border-emerald-400/50">
                                            <span className="text-2xl">📸</span> Capture Frame
                                        </button>
                                        <button onClick={stopCamera}
                                            className="px-6 py-4 bg-slate-800 text-red-400 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-colors border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                            Terminate
                                        </button>
                                    </>
                                )}
                            </div>
                            {camError && (
                                <div className="mx-6 mb-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-red-500/50 text-red-400 text-sm font-bold shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                    ⚠️ ERROR: {camError}
                                </div>
                            )}
                        </div>
                    ) : (
                        <label className="block cursor-pointer">
                            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] p-16 text-center hover:border-cyan-400 group transition-all shadow-[0_0_30px_rgba(34,211,238,0.05)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                                <div className="w-24 h-24 mx-auto bg-cyan-900/30 border border-cyan-500/30 rounded-full flex items-center justify-center text-5xl mb-6 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-500 shadow-inner">🖼️</div>
                                <p className="font-black text-xl text-white">Secure Image Upload</p>
                                <p className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest">PNG, JPG, WEBP</p>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*"
                                onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                    {image && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-700 relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-[32px] shadow-[0_0_30px_rgba(217,70,239,0.1)]">
                            <img src={image} alt="Captured"
                                className="w-full h-56 object-cover rounded-2xl shadow-inner border border-white/10" />
                            <button onClick={processImage} disabled={isLoading}
                                className="w-full py-5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-2xl font-black shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:shadow-[0_0_50px_rgba(217,70,239,0.6)] hover:-translate-y-1 active:translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3 text-lg relative overflow-hidden group border border-fuchsia-400/50">
                                <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative z-10 flex items-center gap-3">
                                    {isLoading
                                        ? <><div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin shadow-[0_0_15px_rgba(255,255,255,0.8)]" /> <span className="uppercase tracking-wider glow-text-intense">{status}</span></>
                                        : <>⚡ Extract & Translate <span className="group-hover:translate-x-2 transition-transform font-mono">_&gt;</span></>}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                    {isLoading && (
                        <div className="p-8 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/50 rounded-[32px] shadow-[0_0_40px_rgba(34,211,238,0.2)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-fuchsia-500/10 animate-pulse mix-blend-screen"></div>
                            <p className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-4 uppercase tracking-widest relative z-10 text-glow">{status}</p>
                            <div className="w-full bg-slate-800 rounded-full h-3 border border-white/10 relative z-10 overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 h-full rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(217,70,239,0.8)]"
                                    style={{ width: `${progressVal}%` }} />
                            </div>
                            <p className="text-right text-xs font-black text-cyan-400 mt-2 relative z-10 font-mono tracking-wider">{Math.round(progressVal)}%</p>
                        </div>
                    )}
                    {ocrText && (
                        <ResultCard icon="📄" title="Extracted Edge Text" text={ocrText} color="slate" delay="delay-100" />
                    )}
                    {translatedText && (
                        <ResultCard
                            icon="🌐"
                            title={`Translation → ${languages.find(l => l.code === tgtLang)?.name}`}
                            text={translatedText}
                            color="indigo"
                            delay="delay-300"
                        />
                    )}
                    {!ocrText && !translatedText && !isLoading && (
                        <div className="h-72 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-[32px] shadow-inner">
                            <div className="w-24 h-24 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-5xl mb-4 opacity-50 shadow-inner"><span className="animate-pulse filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🔍</span></div>
                            <p className="font-black text-sm uppercase tracking-widest opacity-60">Awaiting Image Source</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
const ResultCard = ({ icon, title, text, color, delay }) => (
    <div className={`p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] relative overflow-hidden group animate-in slide-in-from-bottom-8 duration-700 ${delay} shadow-[0_0_30px_rgba(34,211,238,0.05)] hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] transition-all`}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none mix-blend-screen
            ${color === 'indigo' ? 'from-fuchsia-600 to-purple-600' : 'from-cyan-400 to-blue-600'}`}></div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border
                ${color === 'indigo' ? 'bg-fuchsia-900/30 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'}`}>
                {icon}
            </div>
            <h3 className="font-black tracking-wide text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-fuchsia-400 transition-all duration-300">{title}</h3>
        </div>
        <p className="text-lg leading-relaxed text-slate-300 relative z-10 font-medium text-shadow-sm">{text}</p>
    </div>
);
export default CameraTranslator;

