import React, { useState, useMemo } from 'react';

// ── Local AI: Language Detection via Unicode Ranges ──
const UNICODE_RANGES = [
    { name: 'Arabic', regex: /[\u0600-\u06FF]/ },
    { name: 'Chinese', regex: /[\u4E00-\u9FFF]/ },
    { name: 'Japanese', regex: /[\u3040-\u309F\u30A0-\u30FF]/ },
    { name: 'Korean', regex: /[\uAC00-\uD7AF]/ },
    { name: 'Cyrillic (Russian)', regex: /[\u0400-\u04FF]/ },
    { name: 'Devanagari (Hindi)', regex: /[\u0900-\u097F]/ },
    { name: 'Thai', regex: /[\u0E00-\u0E7F]/ },
    { name: 'Greek', regex: /[\u0370-\u03FF]/ },
    { name: 'Hebrew', regex: /[\u0590-\u05FF]/ },
    { name: 'Tamil', regex: /[\u0B80-\u0BFF]/ },
    { name: 'Telugu', regex: /[\u0C00-\u0C7F]/ },
    { name: 'Bengali', regex: /[\u0980-\u09FF]/ },
];

function detectLanguage(text) {
    for (const { name, regex } of UNICODE_RANGES) {
        const matches = (text.match(new RegExp(regex.source, 'g')) || []).length;
        if (matches > text.length * 0.15) return name;
    }
    // Latin-based: use common word heuristics
    const lower = text.toLowerCase();
    if (/\b(the|is|and|of|to|in|for|with)\b/.test(lower)) return 'English';
    if (/\b(le|la|les|de|du|des|est|un|une)\b/.test(lower)) return 'French';
    if (/\b(el|la|los|las|de|en|es|un|una)\b/.test(lower)) return 'Spanish';
    if (/\b(der|die|das|und|ist|ein|eine)\b/.test(lower)) return 'German';
    if (/\b(il|lo|la|di|che|è|un|una)\b/.test(lower)) return 'Italian';
    if (/\b(o|a|os|as|de|do|da|em|é)\b/.test(lower)) return 'Portuguese';
    return 'Unknown (Latin-based)';
}

// ── Local AI: Sentiment Analysis via Lexicon ──
const POSITIVE = ['good','great','love','happy','excellent','amazing','wonderful','best','beautiful','fantastic','awesome','perfect','brilliant','superb','joy','delight','pleasant','nice','fine','like','enjoy','smile','win','success','positive','hope','kind','sweet','warm','bright','cool','fun'];
const NEGATIVE = ['bad','terrible','hate','sad','awful','horrible','worst','ugly','disgusting','poor','fail','pain','angry','annoyed','boring','dull','stupid','wrong','fear','loss','negative','dark','cold','hard','weak','sick','break','cry','hurt','die','kill','war','fight'];

function analyzeSentiment(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let pos = 0, neg = 0;
    words.forEach(w => { if (POSITIVE.includes(w)) pos++; if (NEGATIVE.includes(w)) neg++; });
    const total = pos + neg || 1;
    const score = ((pos - neg) / total * 100);
    const label = score > 25 ? 'Positive 😊' : score < -25 ? 'Negative 😔' : 'Neutral 😐';
    const color = score > 25 ? 'cyan' : score < -25 ? 'red' : 'yellow';
    return { score: Math.round(score), label, positive: pos, negative: neg, color };
}

// ── Local AI: Readability Analysis ──
function analyzeReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.match(/\b\w+\b/g) || [];
    const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
    const sentenceCount = Math.max(sentences.length, 1);
    const wordCount = Math.max(words.length, 1);
    // Flesch-Kincaid Grade Level
    const fkGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59;
    // Flesch Reading Ease
    const fkEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
    const avgWordLen = words.reduce((a, w) => a + w.length, 0) / wordCount;
    let level = 'Advanced';
    if (fkGrade < 6) level = 'Elementary';
    else if (fkGrade < 9) level = 'Middle School';
    else if (fkGrade < 13) level = 'High School';
    else if (fkGrade < 17) level = 'College';
    return { grade: Math.max(0, fkGrade).toFixed(1), ease: Math.min(100, Math.max(0, fkEase)).toFixed(0), level, avgWordLen: avgWordLen.toFixed(1), sentenceCount, wordCount, syllables };
}

function countSyllables(word) {
    word = word.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    const m = word.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
}

// ── Local AI: Word Frequency Cloud ──
const STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','it','as','was','be','are','this','that','these','those','i','you','he','she','we','they','my','your','his','her','our','their','its','me','him','us','them','not','no','do','does','did','will','would','could','should','can','may','might','shall','have','has','had','been','being','am','were','so','if','then','than','also','just','very','too','only']);

function getWordFrequency(text) {
    const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
    const freq = {};
    words.forEach(w => { if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort(([,a], [,b]) => b - a).slice(0, 20);
}

// ── Local AI: Pattern Detection ──
function detectPatterns(text) {
    const patterns = [];
    const words = text.match(/\b\w+\b/g) || [];
    // Palindromes
    const palindromes = [...new Set(words.filter(w => w.length > 2 && w === w.split('').reverse().join('')))];
    if (palindromes.length) patterns.push({ label: 'Palindromes Found', value: palindromes.join(', '), icon: '🔄' });
    // Repeated words
    const freq = {};
    words.forEach(w => { freq[w.toLowerCase()] = (freq[w.toLowerCase()] || 0) + 1; });
    const repeated = Object.entries(freq).filter(([, c]) => c > 2).sort(([, a], [, b]) => b - a).slice(0, 5);
    if (repeated.length) patterns.push({ label: 'Most Repeated', value: repeated.map(([w, c]) => `${w} (${c}x)`).join(', '), icon: '🔁' });
    // Character diversity
    const unique = new Set(text.toLowerCase().replace(/\s/g, '')).size;
    patterns.push({ label: 'Unique Characters', value: `${unique} distinct symbols`, icon: '🎨' });
    // Longest word
    const longest = words.reduce((a, b) => a.length >= b.length ? a : b, '');
    if (longest.length > 3) patterns.push({ label: 'Longest Word', value: `"${longest}" (${longest.length} chars)`, icon: '📏' });
    return patterns;
}

const SmartAnalyzer = () => {
    const [text, setText] = useState('');
    const analysis = useMemo(() => {
        if (text.trim().length < 5) return null;
        return {
            language: detectLanguage(text),
            sentiment: analyzeSentiment(text),
            readability: analyzeReadability(text),
            wordFreq: getWordFrequency(text),
            patterns: detectPatterns(text),
            charCount: text.length,
            wordCount: (text.match(/\b\w+\b/g) || []).length,
        };
    }, [text]);

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="relative z-10 text-center space-y-4">
                <div className="inline-block px-6 py-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-900/30 text-[10px] font-black uppercase tracking-widest text-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                    100% LOCAL • ZERO API KEYS
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-500 to-cyan-400 pb-2 glow-text-intense">
                    Smart Text Analyzer
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-sm font-medium">
                    AI-powered text intelligence running entirely in your browser. Language detection, sentiment analysis, readability scoring — no data leaves your device.
                </p>
            </div>

            {/* Input */}
            <div className="relative z-10">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste or type any text here to analyze it instantly..."
                    className="w-full h-48 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-400 transition-all resize-none text-lg leading-relaxed placeholder:text-slate-500 text-slate-200 shadow-[0_0_30px_rgba(217,70,239,0.05)]"
                />
                {text && (
                    <div className="absolute top-4 right-6 flex gap-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span>{analysis?.charCount || 0} chars</span>
                        <span>{analysis?.wordCount || 0} words</span>
                    </div>
                )}
            </div>

            {/* Results */}
            {analysis && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 relative z-10">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Language Detection */}
                        <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-[28px] shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-cyan-900/50 border border-cyan-500/30 rounded-xl flex items-center justify-center text-lg shadow-[0_0_15px_rgba(34,211,238,0.3)]">🌍</div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Language Detected</h3>
                            </div>
                            <p className="text-3xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-fuchsia-400 transition-all">{analysis.language}</p>
                        </div>

                        {/* Sentiment */}
                        <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-fuchsia-500/30 rounded-[28px] shadow-[0_0_30px_rgba(217,70,239,0.1)] hover:shadow-[0_0_40px_rgba(217,70,239,0.2)] transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-fuchsia-900/50 border border-fuchsia-500/30 rounded-xl flex items-center justify-center text-lg shadow-[0_0_15px_rgba(217,70,239,0.3)]">💭</div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-fuchsia-400">Sentiment</h3>
                            </div>
                            <p className="text-3xl font-black text-white">{analysis.sentiment.label}</p>
                            <div className="mt-3 flex items-center gap-3 text-xs font-bold">
                                <span className="text-cyan-400">+{analysis.sentiment.positive}</span>
                                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${analysis.sentiment.score > 0 ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' : analysis.sentiment.score < 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-yellow-500'}`}
                                        style={{ width: `${Math.min(100, Math.abs(analysis.sentiment.score) + 50)}%` }} />
                                </div>
                                <span className="text-red-400">-{analysis.sentiment.negative}</span>
                            </div>
                        </div>

                        {/* Readability */}
                        <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-[28px] shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-900/50 border border-purple-500/30 rounded-xl flex items-center justify-center text-lg shadow-[0_0_15px_rgba(168,85,247,0.3)]">📊</div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-purple-400">Readability</h3>
                            </div>
                            <p className="text-3xl font-black text-white">{analysis.readability.level}</p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                                <span className="text-slate-400">Grade: <span className="text-white font-black">{analysis.readability.grade}</span></span>
                                <span className="text-slate-400">Ease: <span className="text-white font-black">{analysis.readability.ease}%</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Word Cloud */}
                    {analysis.wordFreq.length > 0 && (
                        <div className="p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] shadow-[0_0_30px_rgba(217,70,239,0.05)]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_20px_rgba(217,70,239,0.4)]">☁️</div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Word Frequency Cloud</h3>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center py-4">
                                {analysis.wordFreq.map(([word, count], i) => {
                                    const size = Math.max(14, Math.min(40, 14 + count * 6));
                                    const hue = (i * 25 + 180) % 360;
                                    return (
                                        <span key={word}
                                            className="px-4 py-2 rounded-2xl border transition-all hover:scale-110 cursor-default font-bold"
                                            style={{
                                                fontSize: `${size}px`,
                                                color: `hsl(${hue}, 70%, 70%)`,
                                                borderColor: `hsla(${hue}, 70%, 50%, 0.3)`,
                                                backgroundColor: `hsla(${hue}, 70%, 20%, 0.2)`,
                                                textShadow: `0 0 15px hsla(${hue}, 70%, 50%, 0.4)`,
                                            }}
                                            title={`Used ${count} time${count > 1 ? 's' : ''}`}
                                        >
                                            {word}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pattern Detection */}
                    {analysis.patterns.length > 0 && (
                        <div className="p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_20px_rgba(34,211,238,0.4)]">🔬</div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Pattern Intelligence</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {analysis.patterns.map((p, i) => (
                                    <div key={i} className="p-4 bg-slate-800/50 border border-slate-700/30 rounded-2xl flex items-start gap-4 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all">
                                        <span className="text-2xl">{p.icon}</span>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{p.label}</p>
                                            <p className="text-sm font-bold text-slate-300">{p.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Text Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Words', value: analysis.readability.wordCount, icon: '📝' },
                            { label: 'Sentences', value: analysis.readability.sentenceCount, icon: '📄' },
                            { label: 'Syllables', value: analysis.readability.syllables, icon: '🔤' },
                            { label: 'Avg Word Length', value: `${analysis.readability.avgWordLen} chars`, icon: '📏' },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-slate-900/60 border border-slate-700/30 rounded-2xl text-center hover:border-fuchsia-500/30 hover:shadow-[0_0_15px_rgba(217,70,239,0.1)] transition-all">
                                <div className="text-2xl mb-2">{stat.icon}</div>
                                <p className="text-xl font-black text-white">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!analysis && text.length > 0 && text.length < 5 && (
                <div className="text-center text-sm text-slate-500 animate-pulse">Type at least 5 characters to begin analysis...</div>
            )}
        </div>
    );
};

export default SmartAnalyzer;
