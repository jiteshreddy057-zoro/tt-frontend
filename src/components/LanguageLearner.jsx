import React, { useState, useEffect, useRef, useCallback } from 'react';
import { languages } from '../constants/languages';
import { DAILY_THEMES, XP_PER_CORRECT, XP_PER_LESSON_COMPLETE, DIFFICULTY_LEVELS } from '../constants/lessonData';
import { getPhoneticHint, getDifferenceHeatmap } from '../services/PhoneticEngine';
import GlobeSelector from './GlobeSelector';
import MascotImg from '../assets/neura_mascot.png';

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
const STORAGE_KEY = 'neura_learn_progress';
const DAILY_GOAL_MINS = 10;

const getProgress = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Reset daily time if it's a new day
            const todayStr = new Date().toDateString();
            if (parsed.lastActiveDate !== todayStr) {
                parsed.timeToday = 0;
                parsed.lastActiveDate = todayStr;
            }
            return parsed;
        }
    } catch {}
    return { 
        xp: 0, 
        activeDates: [], 
        completedLessons: [], 
        timeToday: 0, 
        hearts: 5,
        targetLang: 'fr',
        lastActiveDate: new Date().toDateString() 
    };
};

const saveProgress = (progress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

const updateStreak = (progress) => {
    const today = new Date().toDateString();
    let dates = progress.activeDates || [];
    if (!dates.includes(today)) {
        dates = [...dates, today];
    }
    return { ...progress, activeDates: dates, lastActiveDate: today };
};

const getStreakCount = (dates) => {
    if (!dates || dates.length === 0) return 0;
    let count = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);
    const todayStr = current.toDateString();
    const yesterday = new Date(current);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) return 0;
    let checkDate = dates.includes(todayStr) ? new Date(current) : new Date(yesterday);
    while (true) {
        if (dates.includes(checkDate.toDateString())) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return count;
};

const translateWord = async (word, srcLang, tgtLang) => {
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(word)}&langpair=${encodeURIComponent(srcLang + '|' + tgtLang)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    throw new Error(data.responseDetails || 'Translation failed');
};

const MODES = [
    { id: 'flashcard', label: 'Flashcards', icon: '🃏', desc: 'Flip to learn' },
    { id: 'translate', label: 'Translate', icon: '✍️', desc: 'Type the translation' },
    { id: 'listen', label: 'Listening', icon: '👂', desc: 'Hear & type' },
    { id: 'speak', label: 'Speaking', icon: '🗣️', desc: 'Say it aloud' },
    { id: 'quiz', label: 'Quiz', icon: '🧩', desc: 'Pick the right answer' },
];

const speak = (text, langCode) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (voice) utterance.voice = voice;
    utterance.lang = langCode;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
};

const LanguageLearner = () => {
    const [progress, setProgress] = useState(getProgress);
    const [nativeLang, setNativeLang] = useState('en');
    const [targetLang, setTargetLang] = useState(progress.targetLang || 'fr');
    const [view, setView] = useState('home');
    const [activeMode, setActiveMode] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [translations, setTranslations] = useState({});
    const [loadingTranslations, setLoadingTranslations] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [quizOptions, setQuizOptions] = useState([]);
    const [sessionXP, setSessionXP] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [customTopic, setCustomTopic] = useState('');
    const [generating, setGenerating] = useState(false);
    const [difficulty, setDifficulty] = useState('beginner');
    const [hearts, setHearts] = useState(progress.hearts || 5);
    const [selectedWords, setSelectedWords] = useState([]);
    const [wordPool, setWordPool] = useState([]);
    const [unitPath, setUnitPath] = useState(scenarioEngine.getLearningPath());
    const [matchPairs, setMatchPairs] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [matchedIds, setMatchedIds] = useState([]);
    
    const recognitionRef = useRef(null);
    const inputRef = useRef(null);

    // Time tracking effect
    useEffect(() => {
        let timer;
        if (view === 'exercise') {
            timer = setInterval(() => {
                setProgress(prev => {
                    const updated = { ...prev, timeToday: (prev.timeToday || 0) + 1 };
                    saveProgress(updated);
                    return updated;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [view]);

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Persist target language changes
    useEffect(() => {
        setProgress(prev => {
            const updated = { ...prev, targetLang };
            saveProgress(updated);
            return updated;
        });
    }, [targetLang]);

    const streakCount = getStreakCount(progress.activeDates);
    const timeInMins = Math.floor((progress.timeToday || 0) / 60);
    const goalProgress = Math.min(100, (timeInMins / DAILY_GOAL_MINS) * 100);

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                date: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
                active: (progress.activeDates || []).includes(d.toDateString())
            });
        }
        return days;
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
        }
    }, []);

    const loadTranslations = useCallback(async (lesson) => {
        setLoadingTranslations(true);
        const t = {};
        for (const item of lesson.items) {
            try {
                // Ensure we don't translate if languages are the same
                if (nativeLang === targetLang) {
                    t[item.word] = item.word;
                } else {
                    const translated = await translateWord(item.word, nativeLang, targetLang);
                    t[item.word] = translated;
                }
            } catch (err) {
                console.error('Translation error:', err);
                t[item.word] = item.word + ' (T)'; // Fallback to source with indicator
            }
        }
        setTranslations(t);
        setLoadingTranslations(false);
        return t;
    }, [nativeLang, targetLang]);

    const handleGenerateDynamic = async (topic) => {
        if (hearts <= 0) {
            setView('out-of-hearts');
            return;
        }
        setGenerating(true);
        try {
            const lesson = await scenarioEngine.generateLesson(topic, difficulty);
            const defaultMode = lesson.type === 'dialogue' ? 'translate' : 'quiz';
            startLesson(lesson, defaultMode);
        } catch (error) {
            console.error(error);
        }
        setGenerating(false);
    };

    const startLesson = useCallback(async (lesson, mode) => {
        setActiveLesson(lesson);
        setActiveMode(mode);
        setCurrentIdx(0);
        setFlipped(false);
        setUserInput('');
        setFeedback(null);
        setSessionXP(0);
        setView('exercise');
        const t = await loadTranslations(lesson);
        
        if (lesson.type === 'match' || mode === 'match') {
            const pairs = [];
            lesson.items.forEach((item, idx) => {
                pairs.push({ id: `src-${idx}`, text: item.word, pairId: idx, type: 'src' });
                pairs.push({ id: `tgt-${idx}`, text: t[item.word], pairId: idx, type: 'tgt' });
            });
            setMatchPairs(pairs.sort(() => Math.random() - 0.5));
            setMatchedIds([]);
            setSelectedMatch(null);
        }

        if (lesson.type === 'wordbank' || mode === 'wordbank') {
            const currentItem = lesson.items[0];
            const correct = t[currentItem.word] || '';
            const tokens = correct.split(' ').filter(w => w.length > 0);
            
            // Use other translated words from the lesson as distractors instead of hardcoded English
            const otherTranslations = Object.values(t).filter(val => val !== correct);
            const distractors = otherTranslations.length > 0 
                ? otherTranslations.sort(() => Math.random() - 0.5).slice(0, 3)
                : ['the', 'is', 'a'].filter(d => !tokens.includes(d)); // Ultimate fallback
            
            const pool = [...tokens, ...distractors].sort(() => Math.random() - 0.5);
            setWordPool(pool);
            setSelectedWords([]);
        }

        if (mode === 'quiz') {
            generateQuizOptions(lesson.items[0], t, lesson.items);
        }
    }, [loadTranslations]);

    // Load or generate initial lesson path
    useEffect(() => {
        setUnitPath(scenarioEngine.getLearningPath());
    }, [targetLang]);

    const generateQuizOptions = (item, trans, allItems) => {
        const correct = trans[item.word] || '...';
        const others = allItems
            .filter(i => i.word !== item.word)
            .map(i => trans[i.word] || '...')
            .filter(t => t !== correct && t !== '...');
        const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [...shuffled, correct].sort(() => Math.random() - 0.5);
        setQuizOptions(options);
    };

    const awardXP = (amount) => {
        setSessionXP(prev => prev + amount);
        setProgress(prev => {
            const updated = updateStreak({ 
                ...prev, 
                xp: prev.xp + amount
            });
            saveProgress(updated);
            return updated;
        });
    };

    const checkAnswer = (answer) => {
        if (!activeLesson) return;
        const item = activeLesson.items[currentIdx];
        const correct = translations[item.word] || '';
        const isCorrect = answer.trim().toLowerCase() === correct.trim().toLowerCase();
        if (isCorrect) {
            awardXP(XP_PER_CORRECT);
            setFeedback({ correct: true, expected: correct });
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 1200);
        } else {
            setHearts(prev => Math.max(0, prev - 1));
            setFeedback({ correct: false, expected: correct });
        }
    };

    const nextItem = (id) => {
        if (!activeLesson) return;
        const next = id !== undefined ? id : currentIdx + 1;
        if (next >= activeLesson.items.length) {
            awardXP(XP_PER_LESSON_COMPLETE);
            
            // Check if this was the last unit in the path
            const isLastUnit = activeLesson.title.toLowerCase().includes('the end');
            
            setProgress(prev => {
                const updated = { 
                    ...prev, 
                    xp: prev.xp + XP_PER_LESSON_COMPLETE,
                    completedLessons: [...(prev.completedLessons || []), `${activeLesson.title}_${targetLang}`]
                };
                saveProgress(updated);
                return updated;
            });

            if (isLastUnit) {
                // Course completion!
                awardXP(500); // Massive bonus
                setView('course-complete');
                return;
            }
            setView('complete');
            return;
        }
        setCurrentIdx(next);
        setFlipped(false);
        setUserInput('');
        setFeedback(null);
        setSelectedWords([]);
        
        if (activeMode === 'quiz' && activeLesson.type !== 'dialogue') {
            generateQuizOptions(activeLesson.items[next], translations, activeLesson.items);
        }

        if (activeLesson.type === 'wordbank' || activeMode === 'wordbank') {
            const nextItem = activeLesson.items[next];
            const correct = translations[nextItem.word] || '';
            const tokens = correct.split(' ').filter(w => w.length > 0);
            
            const otherTranslations = Object.values(translations).filter(val => val !== correct);
            const distractors = otherTranslations.length > 0 
                ? otherTranslations.sort(() => Math.random() - 0.5).slice(0, 3)
                : ['the', 'is', 'a'].filter(d => !tokens.includes(d));

            const pool = [...tokens, ...distractors].sort(() => Math.random() - 0.5);
            setWordPool(pool);
            setSelectedWords([]);
        }

        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleWordClick = (word, fromPool) => {
        if (feedback) return;
        if (fromPool) {
            setSelectedWords([...selectedWords, word]);
            setWordPool(wordPool.filter((w, i) => i !== wordPool.indexOf(word)));
        } else {
            setWordPool([...wordPool, word]);
            setSelectedWords(selectedWords.filter((w, i) => i !== selectedWords.lastIndexOf(word)));
        }
    };

    const checkBankAnswer = () => {
        const answer = selectedWords.join(' ');
        checkAnswer(answer);
    };

    const handleSpeak = () => {
        if (!recognitionRef.current || !activeLesson) return;
        const item = activeLesson.items[currentIdx];
        const targetLangObj = languages.find(l => l.code === targetLang);
        const speechLang = targetLangObj?.speech || targetLang;
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
            setIsRecording(false);
            const correct = translations[item.word] || '';
            const isCorrect = transcript.trim().toLowerCase().includes(correct.trim().toLowerCase().substring(0, Math.max(3, correct.length * 0.5)));
            if (isCorrect) {
                awardXP(XP_PER_CORRECT);
                const heatmap = getDifferenceHeatmap(correct, transcript);
                setFeedback({ correct: true, expected: correct, heatmap });
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 1200);
            } else {
                const heatmap = getDifferenceHeatmap(correct, transcript);
                setHearts(prev => Math.max(0, prev - 1));
                setFeedback({ correct: false, expected: correct, got: transcript, heatmap });
            }
        };
        recognitionRef.current.onerror = () => setIsRecording(false);
        recognitionRef.current.onend = () => setIsRecording(false);
        setIsRecording(true);
        recognitionRef.current.start();
    };

    const targetLangObj = languages.find(l => l.code === targetLang);
    const targetSpeech = targetLangObj?.speech || targetLang;

    if (view === 'out-of-hearts') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in fade-in duration-700">
                <div className="text-8xl mb-6">💔</div>
                <h1 className="text-4xl font-black mb-3">Out of Hearts</h1>
                <p className="text-slate-500 mb-8">Wait for hearts to refill or practice old lessons to gain more!</p>
                <button onClick={() => setView('home')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl">
                    Back to Home
                </button>
            </div>
        );
    }

    if (view === 'complete') {
        const xpGoal = 1000;
        const xpProgress = Math.min(100, (progress.xp / xpGoal) * 100);
        
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in zoom-in duration-700 pb-32">
                <div className="relative w-48 h-48 mx-auto mb-10">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 88} strokeDashoffset={2 * Math.PI * 88 * (1 - xpProgress / 100)} className="text-blue-500 transition-all duration-[2000ms] ease-out shadow-lg" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl animate-bounce">🎉</span>
                    </div>
                </div>

                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Unit Mastered!
                </h1>

                <div className="flex justify-center mb-10">
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-left duration-700 w-full max-w-xs">
                        <p className="text-4xl font-black text-blue-600">+{sessionXP}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">XP Earned</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Streak Status</p>
                        <p className="text-6xl animate-pulse">🔥 {streakCount}</p>
                    </div>

                    <button onClick={() => setView('home')} className="w-full max-w-sm py-5 bg-blue-600 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
                        Continue to Path →
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'exercise' && activeLesson && activeMode) {
        const item = activeLesson.items[currentIdx];
        const translated = translations[item.word] || '...';
        const progressPct = ((currentIdx + (feedback ? 1 : 0)) / activeLesson.items.length) * 100;

        return (
            <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-500 pb-24">
                {showCelebration && (
                    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                        <div className="text-8xl animate-ping">✨</div>
                    </div>
                )}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setView('home')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 font-black">
                        ✕
                    </button>
                    <div className="flex-1 mx-8 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 relative">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out" style={{ width: `${progressPct}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[8px] font-black uppercase text-slate-400 opacity-50">
                                {languages.find(l => l.code === targetLang)?.name} Mastery
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-red-500 font-black">
                            <span>❤️</span> {hearts}
                        </div>
                        <div className="flex items-center gap-1 text-blue-500 font-black">
                            <span>🔥</span> {sessionXP}
                        </div>
                    </div>
                </div>

                {activeMode === 'match' ? (
                    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in zoom-in duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-slate-700 dark:text-slate-300">Match the Pairs</h2>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Connecting words with translations</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {matchPairs.map((pair) => {
                                const isMatched = matchedIds.includes(pair.pairId);
                                const isSelected = selectedMatch?.id === pair.id;
                                if (isMatched) return <div key={pair.id} className="h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center border-2 border-emerald-500/20 opacity-40 transition-all">✨</div>;
                                
                                return (
                                    <button
                                        key={pair.id}
                                        onClick={() => {
                                            if (!selectedMatch) {
                                                setSelectedMatch(pair);
                                            } else if (selectedMatch.id === pair.id) {
                                                setSelectedMatch(null);
                                            } else if (selectedMatch.type !== pair.type && selectedMatch.pairId === pair.pairId) {
                                                // Success!
                                                setMatchedIds([...matchedIds, pair.pairId]);
                                                setSelectedMatch(null);
                                                awardXP(XP_PER_CORRECT);
                                                if (matchedIds.length + 1 === activeLesson.items.length) {
                                                    // Lesson complete!
                                                    setTimeout(() => nextItem(), 500);
                                                }
                                            } else {
                                                // Fail
                                                setSelectedMatch(pair);
                                            }
                                        }}
                                        className={`h-20 rounded-2xl font-black text-lg shadow-sm transition-all border-b-4 
                                            ${isSelected ? 'bg-blue-500 text-white border-blue-700 scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-900 hover:-translate-y-1'}`}
                                    >
                                        {pair.text}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        {/* Word Bank View */}
                        {activeMode === 'wordbank' || activeLesson.type === 'wordbank' ? (
                            <div className="w-full max-w-2xl flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500">
                                <div className="flex items-center gap-6 bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-700 relative">
                                    <div className="absolute -top-12 -left-4 w-28 h-28 drop-shadow-2xl animate-bounce duration-[3000ms]">
                                        <img src={MascotImg} alt="Mascot" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="w-20" /> {/* Spacer for mascot */}
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Translate this sentence</p>
                                        <p className="text-2xl font-black">{item.word}</p>
                                    </div>
                                    <button onClick={() => speak(item.word, 'en-US')} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:scale-110 transition-all">🔊</button>
                                </div>

                                <div className="min-h-[120px] p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 items-center justify-center">
                                    {selectedWords.length === 0 && <p className="text-slate-400 font-bold italic">Tap words to build translation...</p>}
                                    {selectedWords.map((word, i) => (
                                        <button key={i} onClick={() => handleWordClick(word, false)} className="px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border-b-4 border-slate-200 dark:border-slate-950 font-black hover:-translate-y-1 transition-all">
                                            {word}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center py-6">
                                    {wordPool.map((word, i) => (
                                        <button key={i} onClick={() => handleWordClick(word, true)} className="px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-b-4 border-slate-200 dark:border-slate-950 font-black hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Other Modes ... */}

                        {loadingTranslations ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                                <p className="text-sm font-bold text-slate-400">Preparing lesson...</p>
                            </div>
                        ) : activeMode === 'flashcard' ? (
                            <div className="flex flex-col items-center w-full">
                                <div
                                    onClick={() => {
                                        setFlipped(!flipped);
                                        if (!flipped) speak(translated, targetSpeech);
                                    }}
                                    className="w-full max-w-md h-72 cursor-pointer perspective-1000 group"
                                >
                                    <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}
                                        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : '' }}>
                                        <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-8"
                                            style={{ backfaceVisibility: 'hidden' }}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                                                {languages.find(l => l.code === nativeLang)?.name}
                                            </p>
                                            <p className="text-3xl font-black text-center">{item.word}</p>
                                            <p className="text-sm text-slate-400 mt-6">Tap to flip</p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-8"
                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-4">
                                                {languages.find(l => l.code === targetLang)?.name}
                                            </p>
                                            <p className="text-3xl font-black text-white text-center">{translated}</p>
                                            <button onClick={(e) => { e.stopPropagation(); speak(translated, targetSpeech); }}
                                                className="mt-6 p-3 bg-white/20 rounded-2xl text-white hover:bg-white/30 transition-colors text-xl">
                                                🔊
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button onClick={() => { awardXP(XP_PER_CORRECT); nextItem(); }}
                                        className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">
                                        ✅ I knew this
                                    </button>
                                    <button onClick={nextItem}
                                        className="px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold hover:scale-105 transition-all border border-slate-200 dark:border-slate-700">
                                        Next →
                                    </button>
                                </div>
                            </div>
                        ) : activeMode === 'translate' ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 p-8 mb-6 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Translate this</p>
                                    {item.icon && <div className="text-6xl mb-4">{item.icon}</div>}
                                    <p className="text-3xl font-black">{item.word}</p>
                                </div>
                                <div className="w-full max-w-md">
                                    <input ref={inputRef} type="text" value={userInput}
                                        onChange={e => setUserInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !feedback) checkAnswer(userInput); }}
                                        placeholder={`Type in ${languages.find(l => l.code === targetLang)?.name}...`}
                                        disabled={!!feedback}
                                        className="w-full p-5 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 font-bold transition-colors shadow-sm"
                                        autoFocus
                                    />
                                </div>
                                {feedback ? (
                                    <div className={`w-full max-w-md mt-4 p-5 rounded-2xl ${feedback.correct ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                        <p className="font-black text-lg">{feedback.correct ? '✅ Correct!' : '❌ Not quite'}</p>
                                        <p className="text-sm mt-1 opacity-70">Answer: <span className="font-bold">{feedback.expected}</span></p>
                                        <button onClick={nextItem} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-all w-full">
                                            Continue →
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => checkAnswer(userInput)}
                                        disabled={!userInput.trim()}
                                        className="mt-6 px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-all disabled:opacity-50">
                                        Check Answer
                                    </button>
                                )}
                            </div>
                        ) : activeMode === 'listen' ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-full max-w-md bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] shadow-2xl p-8 mb-6 text-center text-white">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-4">Listen carefully</p>
                                    <button onClick={() => speak(translated, targetSpeech)}
                                        className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center text-5xl hover:bg-white/30 transition-all hover:scale-110 mx-auto shadow-inner">
                                        🔊
                                    </button>
                                    <p className="text-sm mt-4 text-white/60">Tap to hear the word</p>
                                </div>
                                <div className="w-full max-w-md">
                                    <input ref={inputRef} type="text" value={userInput}
                                        onChange={e => setUserInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !feedback) checkAnswer(userInput); }}
                                        placeholder="Type what you heard..."
                                        disabled={!!feedback}
                                        className="w-full p-5 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-purple-500 font-bold transition-colors shadow-sm"
                                        autoFocus
                                    />
                                </div>
                                {feedback ? (
                                    <div className={`w-full max-w-md mt-4 p-5 rounded-2xl ${feedback.correct ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                        <p className="font-black text-lg">{feedback.correct ? '✅ Correct!' : '❌ Not quite'}</p>
                                        <p className="text-sm mt-1 opacity-70">Answer: <span className="font-bold">{feedback.expected}</span></p>
                                        <button onClick={nextItem} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-all w-full">
                                            Continue →
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => checkAnswer(userInput)}
                                        disabled={!userInput.trim()}
                                        className="mt-6 px-12 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-500/20 hover:scale-105 transition-all disabled:opacity-50">
                                        Check Answer
                                    </button>
                                )}
                            </div>
                        ) : activeMode === 'speak' ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 p-8 mb-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Say this in {languages.find(l => l.code === targetLang)?.name}</p>
                                    <p className="text-2xl font-black mb-1">{translated}</p>
                                    {getPhoneticHint(translated, targetLang) && (
                                        <p className="text-sm font-black text-blue-500 mb-4">{getPhoneticHint(translated, targetLang)}</p>
                                    )}
                                    <button onClick={() => speak(translated, targetSpeech)}
                                        className="px-6 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto">
                                        🔊 Hear Again
                                    </button>
                                </div>
                                <button onClick={handleSpeak}
                                    className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all ${isRecording
                                        ? 'bg-red-500 text-white animate-pulse scale-110'
                                        : 'bg-blue-600 text-white hover:scale-110 shadow-blue-500/40'}`}
                                >
                                    {isRecording ? '⏹️' : '🎙️'}
                                </button>
                                {userInput && (
                                    <p className="mt-4 text-sm text-slate-500">You said: <span className="font-bold text-slate-700 dark:text-slate-300">"{userInput}"</span></p>
                                )}
                                {feedback ? (
                                    <div className={`w-full max-w-md mt-6 p-6 rounded-[32px] ${feedback.correct ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20 shadow-xl'}`}>
                                        <p className="font-black text-lg mb-4">{feedback.correct ? '✅ Great pronunciation!' : '❌ Try again'}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/50 dark:bg-black/20 rounded-2xl">
                                            {feedback.heatmap?.map((item, i) => (
                                                <span key={i} className={`px-2 py-1 rounded-lg font-bold text-sm ${item.score === 1 ? 'text-emerald-600' : 'text-red-500 bg-red-500/10 underline decoration-wavy'}`}>
                                                    {item.word}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Analysis</p>
                                        <p className="text-sm opacity-70">Expected: <span className="font-bold">{feedback.expected}</span></p>
                                        <button onClick={nextItem} className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:scale-105 shadow-lg active:scale-95 transition-all">
                                            Continue →
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ) : activeMode === 'quiz' ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 p-8 mb-6 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What is the translation of</p>
                                    {item.icon && <div className="text-6xl mb-4">{item.icon}</div>}
                                    <p className="text-3xl font-black">{item.word}</p>
                                </div>
                                <div className="w-full max-w-md grid grid-cols-1 gap-3">
                                    {quizOptions.map((opt, i) => {
                                        const isCorrect = opt.trim().toLowerCase() === translated.trim().toLowerCase();
                                        const wasSelected = feedback && (feedback.selected === opt);
                                        let btnClass = 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-500/5';
                                        if (feedback) {
                                            if (isCorrect) btnClass = 'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-700';
                                            else if (wasSelected && !isCorrect) btnClass = 'bg-red-500/10 border-2 border-red-500 text-red-700';
                                            else btnClass = 'bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 opacity-50';
                                        }
                                        return (
                                            <button key={i}
                                                onClick={() => {
                                                    if (feedback) return;
                                                    const isReallyCorrect = opt.trim().toLowerCase() === translated.trim().toLowerCase();
                                                    if (isReallyCorrect) {
                                                        awardXP(XP_PER_CORRECT);
                                                        setFeedback({ correct: true, expected: translated, selected: opt });
                                                        setShowCelebration(true);
                                                        setTimeout(() => setShowCelebration(false), 1200);
                                                    } else {
                                                        setFeedback({ correct: false, expected: translated, selected: opt });
                                                    }
                                                }}
                                                className={`w-full p-5 rounded-2xl font-bold text-left text-lg transition-all shadow-sm ${btnClass}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                                {feedback && (
                                    <div className="mt-8 text-center text-slate-400 font-bold italic animate-pulse">
                                        Check the feedback below
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
                
                {/* Bottom Feedback Bar */}
                <div className={`fixed bottom-0 left-0 right-0 p-8 z-40 transition-all duration-500 border-t-2 ${
                    !feedback ? 'bg-white dark:bg-slate-900 translate-y-0' :
                    feedback.correct ? 'bg-emerald-100 border-emerald-200 text-emerald-900' : 'bg-red-100 border-red-200 text-red-900'
                }`}>
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {feedback && (
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 ${feedback.correct ? 'bg-white border-emerald-500' : 'bg-white border-red-500'}`}>
                                    {feedback.correct ? '✅' : '❌'}
                                </div>
                            )}
                            <div>
                                {feedback ? (
                                    <>
                                        <p className="text-2xl font-black">{feedback.correct ? 'You are correct!' : 'Correct solution:'}</p>
                                        {!feedback.correct && <p className="text-lg font-bold opacity-80">{feedback.expected}</p>}
                                    </>
                                ) : (
                                    <button className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Skip Item</button>
                                )}
                            </div>
                        </div>
                        
                        {(activeMode === 'wordbank' || activeLesson.type === 'wordbank') && !feedback ? (
                            <button onClick={checkBankAnswer} disabled={selectedWords.length === 0}
                                className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-xl disabled:opacity-50">
                                Check
                            </button>
                        ) : feedback ? (
                            <button onClick={nextItem} className={`px-12 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-xl text-white ${feedback.correct ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                                Continue
                            </button>
                        ) : activeMode === 'flashcard' ? (
                            <button onClick={() => { setFlipped(true); speak(translated, targetSpeech); checkAnswer(translated); }} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-xl">
                                Reveal
                            </button>
                        ) : (
                            <button disabled={!userInput.trim()} onClick={() => checkAnswer(userInput)} className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-xl disabled:opacity-50">
                                Check
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const todayDayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const dailyTopic = DAILY_THEMES[todayDayOfYear % DAILY_THEMES.length];

    if (view === 'home') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700 pb-32">
                {/* Header Stats */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🔥</span>
                            <span className="font-black text-orange-500">{streakCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl text-blue-500">✨</span>
                            <span className="font-black text-blue-500">{progress.xp} XP</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select value={targetLang} onChange={e => setTargetLang(e.target.value)} 
                            className="bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-3 py-1.5 font-bold text-xs outline-none">
                            {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Duolingo-style Path */}
                <div className="flex flex-col items-center gap-12 py-10 relative">
                    {/* SVG Connector Path */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10" style={{ zIndex: 0 }}>
                        {unitPath.map((unit, idx) => {
                            if (idx === unitPath.length - 1) return null;
                            const isVp = idx % 2 === 0; // Winding pattern logic
                            const x1 = isVp ? 'calc(50% + 40px)' : 'calc(50% - 40px)';
                            const x2 = isVp ? 'calc(50% - 40px)' : 'calc(50% + 40px)';
                            const y1 = idx * 152 + 48; // Node height + gap
                            const y2 = (idx + 1) * 152 + 48;
                            return (
                                <path 
                                    key={`path-${idx}`}
                                    d={`M ${x1} ${y1} C ${x1} ${y1 + 50}, ${x2} ${y2 - 50}, ${x2} ${y2}`}
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    className="text-slate-400"
                                />
                            );
                        })}
                    </svg>

                    {unitPath.map((unit, idx) => {
                        const isCompleted = (progress.completedLessons || []).includes(`${unit.title}_${targetLang}`);
                        const isAvailable = idx === 0 || (progress.completedLessons || []).includes(`${unitPath[idx-1].title}_${targetLang}`);
                        
                        const marginLeft = idx % 2 === 0 ? '0' : '80px';
                        const marginRight = idx % 2 === 0 ? '80px' : '0';

                        return (
                            <div key={unit.id} className="flex flex-col items-center relative z-10" style={{ marginLeft, marginRight }}>
                                <button
                                    disabled={!isAvailable}
                                    onClick={() => handleGenerateDynamic(unit.topic)}
                                    className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl relative group transition-all duration-500
                                        ${isCompleted ? 'bg-yellow-400 border-b-8 border-yellow-600' : 
                                          isAvailable ? 'bg-blue-500 border-b-8 border-blue-700 hover:scale-110 active:scale-95' : 
                                          'bg-slate-200 border-b-8 border-slate-300 opacity-60'}`}
                                >
                                    {isCompleted ? '⭐' : unit.icon}
                                    
                                    {isAvailable && !isCompleted && (
                                        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/20 pointer-events-none" />
                                    )}

                                    {/* Tooltip */}
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50">
                                        Unit {unit.id}: {unit.title}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
                                    </div>
                                </button>
                                <span className={`mt-4 font-black text-sm uppercase tracking-widest ${isAvailable ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300'}`}>
                                    {unit.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Globe & Daily Challenge */}
                <div className="pt-20">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black">Skill Challenge</h2>
                            <p className="opacity-80 font-medium">Earn double XP with today's focus: {dailyTopic}</p>
                            <button onClick={() => handleGenerateDynamic()} className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                                Practice Now →
                            </button>
                        </div>
                        <div className="w-full max-w-[400px]">
                            <GlobeSelector onSelectLanguage={setTargetLang} currentLanguage={targetLang} />
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    if (view === 'course-complete') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-8 p-10 text-center animate-in zoom-in duration-700 bg-white dark:bg-slate-900">
                <div className="w-64 h-64 bg-yellow-400 rounded-full flex items-center justify-center text-[100px] shadow-2xl relative">
                    🏆
                    <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/50" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Course Complete!</h1>
                    <p className="text-xl text-slate-500 font-bold">You've mastered {languages.find(l => l.code === targetLang)?.name}!</p>
                    <div className="flex gap-4 justify-center">
                        <div className="p-8 bg-blue-500 rounded-3xl text-white shadow-xl w-48">
                            <p className="text-[10px] font-black uppercase opacity-60">Mastery XP</p>
                            <p className="text-3xl font-black">+500</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setView('home')} className="px-12 py-5 bg-blue-600 text-white rounded-full font-black shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none">
                    Back to Skills →
                </button>
            </div>
        );
    }


    // Default view if none of the above conditions are met (e.g., 'dashboard' view)
    return null;
};

export default LanguageLearner;
