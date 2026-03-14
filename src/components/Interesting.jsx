import React, { useState } from 'react';

const triviaData = [
    {
        id: 1,
        title: "The Most Translateable Book",
        fact: "The Bible is the most translated book in the world, available in over 3,300 languages.",
        icon: "📖"
    },
    {
        id: 2,
        title: "The Language Isolate",
        fact: "Basque (Euskara) is a language isolate, meaning it has no known linguistic relatives anywhere in the world.",
        icon: "🏔️"
    },
    {
        id: 3,
        title: "The Shortest Alphabet",
        fact: "Rotokas, spoken in Papua New Guinea, has only 12 letters in its alphabet.",
        icon: "🔤"
    },
    {
        id: 4,
        title: "Whistled Languages",
        fact: "Silbo Gomero is a whistled language used in the Canary Islands. It can be heard over 3 miles away!",
        icon: "🌬️"
    },
    {
        id: 5,
        title: "The Most Spoken Language",
        fact: "By total number of speakers (native and non-native), English is the most spoken language, followed closely by Mandarin.",
        icon: "🗣️"
    },
    {
        id: 6,
        title: "Cryptophasia",
        fact: "Twins often develop their own secret language, a phenomenon known as cryptophasia.",
        icon: "👯"
    }
];

const Interesting = () => {
    const [activeId, setActiveId] = useState(null);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-1000">
            <header className="text-center mb-16 relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.3)] mb-6 animate-pulse">
                    Fascinating Linguistics
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 pb-2 text-glow relative glow-text-intense">
                    Language Trivia
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto mt-4 font-medium text-lg text-shadow-sm">
                    Explore the weird, wonderful, and extraordinary aspects of human communication.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                {triviaData.map((item) => (
                    <div
                        key={item.id}
                        onMouseEnter={() => setActiveId(item.id)}
                        onMouseLeave={() => setActiveId(null)}
                        className={`group relative h-80 w-full perspective-1000 ${
                            activeId && activeId !== item.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                        } transition-all duration-500`}
                    >
                        {/* Glow Behind Card */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse"></div>
                        
                        <div className={`relative h-full w-full rounded-3xl bg-slate-900 border border-slate-700/50 p-6 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500`}>
                            {/* Inner Radial Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 z-0"></div>
                            
                            <div className="relative z-10 flex flex-col items-center gap-6 transform transition-transform duration-500 group-hover:-translate-y-4">
                                <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] group-hover:scale-125 transition-transform duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-fuchsia-400 transition-all duration-300">
                                    {item.title}
                                </h3>
                            </div>

                            {/* Hidden Fact that slides up */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900/90 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out border-t border-fuchsia-500/30">
                                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                    {item.fact}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Interesting;
