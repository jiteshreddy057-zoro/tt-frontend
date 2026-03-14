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
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                        Camera Translator
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Point camera → Extract text → Translate instantly</p>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase ml-2">Translate to:</span>
                    <select value={tgtLang} onChange={e => setTgtLang(e.target.value)}
                        className="bg-transparent text-sm font-bold outline-none cursor-pointer pr-4">
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
                {['camera', 'upload'].map(m => (
                    <button key={m} onClick={() => setInputMode(m)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === m
                            ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                            : 'text-slate-400 hover:text-slate-600'}`}>
                        {m === 'camera' ? '📸 Live Camera' : '🖼️ Upload Image'}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {inputMode === 'camera' ? (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="relative bg-black aspect-video w-full">
                                <video ref={videoRef} autoPlay playsInline muted
                                    className={`w-full h-full object-cover ${camActive ? 'opacity-100' : 'opacity-0'}`} />
                                <canvas ref={canvasRef} className="hidden" />
                                {!camActive && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                                        <span className="text-6xl">📷</span>
                                        <p className="font-bold text-sm text-white/70">Camera is off</p>
                                    </div>
                                )}
                                {camActive && (
                                    <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
                                        className="absolute top-3 right-3 p-2 bg-black/50 rounded-xl text-white text-lg hover:bg-black/70 transition-colors"
                                        title="Flip camera">
                                        🔄
                                    </button>
                                )}
                            </div>
                            <div className="p-4 flex gap-3">
                                {!camActive ? (
                                    <button onClick={startCamera}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                                        📷 Start Camera
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={captureFrame}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                                            📸 Capture
                                        </button>
                                        <button onClick={stopCamera}
                                            className="px-5 py-3 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-colors">
                                            Stop
                                        </button>
                                    </>
                                )}
                            </div>
                            {camError && (
                                <div className="mx-4 mb-4 p-3 rounded-2xl bg-red-500/10 text-red-500 text-sm font-semibold">
                                    ⚠️ {camError}
                                </div>
                            )}
                        </div>
                    ) : (
                        <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl p-10 text-center hover:border-blue-400 hover:bg-blue-500/5 transition-all">
                                <span className="text-5xl">🖼️</span>
                                <p className="font-semibold text-slate-500 mt-3">Click to upload an image</p>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*"
                                onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                    {image && (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-400">
                            <img src={image} alt="Captured"
                                className="w-full h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg" />
                            <button onClick={processImage} disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                {isLoading
                                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{status}</>
                                    : '⚡ Extract & Translate'}
                            </button>
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                    {isLoading && (
                        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
                            <p className="text-xs font-black text-blue-500 mb-3 uppercase tracking-widest">{status}</p>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${progressVal}%` }} />
                            </div>
                            <p className="text-right text-xs text-slate-400 mt-1">{Math.round(progressVal)}%</p>
                        </div>
                    )}
                    {ocrText && (
                        <ResultCard icon="📄" title="Extracted Text" text={ocrText} color="slate" />
                    )}
                    {translatedText && (
                        <ResultCard
                            icon="🌐"
                            title={`Translation → ${languages.find(l => l.code === tgtLang)?.name}`}
                            text={translatedText}
                            color="indigo"
                        />
                    )}
                    {!ocrText && !translatedText && !isLoading && (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
                            <span className="text-6xl mb-3">🔍</span>
                            <p className="font-bold">Results appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
const ResultCard = ({ icon, title, text, color }) => (
    <div className={`p-6 bg-white dark:bg-slate-800/60 rounded-3xl shadow-xl border
        ${color === 'indigo' ? 'border-indigo-500/20' : 'border-slate-200 dark:border-slate-700'}
        animate-in slide-in-from-bottom-4 duration-500`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-xl">
                {icon}
            </div>
            <h3 className="font-black">{title}</h3>
        </div>
        <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">{text}</p>
    </div>
);
export default CameraTranslator;

