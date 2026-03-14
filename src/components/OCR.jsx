import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { saveHistory } from '../services/api';
import { preprocessImageForOCR, cleanOCRText } from '../utils/imagePreprocessing';
import { arrangeOCRText } from '../utils/ocrFormatter';
const OCR = () => {
    const [image, setImage] = useState(null);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [isFormatted, setIsFormatted] = useState(false);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [rawText, setRawText] = useState('');
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(URL.createObjectURL(file));
            setText('');
            setRawText('');
            setIsFormatted(false);
            setProgress(0);
            setStatus('');
        }
    };
    const handleOCR = async () => {
        if (!image) return;
        setLoading(true);
        setText('');
        setRawText('');
        setIsFormatted(false);
        setProgress(0);
        try {
            setStatus('Optimizing image…');
            const processedImage = await preprocessImageForOCR(image);
            setStatus('Initializing Engine…');
            const result = await Tesseract.recognize(processedImage, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                    setStatus(m.status);
                },
            });
            const cleanedText = cleanOCRText(result.data.text);
            const finalText = privacyMode ? redactPII(cleanedText) : cleanedText;
            setText(finalText);
            setRawText(cleanedText);
            setStatus('✅ Done');
            const username = localStorage.getItem('username') || 'anonymous';
            saveHistory({
                username,
                type: 'OCR',
                sourceText: 'Image Upload',
                resultText: cleanedText.substring(0, 100) + '...'
            }).catch(() => { });
        } catch (err) {
            setStatus('❌ Error: ' + err);
        } finally {
            setLoading(false);
        }
    };
    const redactPII = (text) => {
        return text
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REDACTED]')
            .replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE REDACTED]')
            .replace(/\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, '[CARD REDACTED]');
    };

    const togglePrivacy = () => {
        const newMode = !privacyMode;
        setPrivacyMode(newMode);
        if (rawText) {
            setText(newMode ? redactPII(rawText) : rawText);
        }
    };

    const toggleSmartArrange = () => {
        if (!isFormatted) {
            const arranged = arrangeOCRText(rawText);
            setText(arranged);
            setIsFormatted(true);
        } else {
            setText(rawText);
            setIsFormatted(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    Neural OCR
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Extract structured data from any image with local AI</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <label className="block group">
                        <div className={`relative aspect-[4/3] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6
                            ${image ? 'border-blue-500 bg-blue-50/10' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                            {image ? (
                                <img src={image} alt="Upload" className="w-full h-full object-contain rounded-xl" />
                            ) : (
                                <>
                                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                                    <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Drop your file here</p>
                                    <p className="text-sm text-slate-400 mt-1">PNG, JPG or WEBP (Max 10MB)</p>
                                </>
                            )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <button
                        onClick={handleOCR}
                        disabled={!image || loading}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{status}...</span>
                            </div>
                        ) : (
                            <>
                                <span>Extract Text</span>
                                <span className="group-hover:translate-x-1 transition-transform">⚡</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="h-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Result Card</span>
                            <div className="flex gap-2">
                                {text && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={togglePrivacy}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                                                ${privacyMode ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white'}`}
                                        >
                                            {privacyMode ? '🔒 Privacy On' : '🔓 Privacy Off'}
                                        </button>
                                        <button 
                                            onClick={toggleSmartArrange}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                                                ${isFormatted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white'}`}
                                        >
                                            {isFormatted ? '✨ Structured' : '✨ Smart Arrange'}
                                        </button>
                                    </div>
                                )}
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            </div>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto relative">
                            {loading && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 animate-in fade-in">
                                    <p className="text-xs font-black text-blue-500 mb-4 animate-pulse uppercase tracking-widest">{status}</p>
                                    <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 font-bold">{progress}% COMPLETED</p>
                                </div>
                            )}
                            {text ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                                        {text}
                                    </p>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                                    <span className="text-6xl mb-4">🔍</span>
                                    <p className="font-bold text-sm">Wait for output...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-8 py-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-xl shadow-inner">💡</div>
                    <div>
                        <h4 className="font-bold text-sm">Privacy Intelligence</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Your documents are processed locally using WebAssembly. No data is sent to the cloud.</p>
                    </div>
                </div>
                <div className="hidden sm:block text-[10px] font-black bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full uppercase tracking-widest">
                    v4.0 Core
                </div>
            </div>
        </div>
    );
};
export default OCR;

