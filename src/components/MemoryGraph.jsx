import React, { useEffect, useState, useRef } from 'react';
import { getHistory } from '../services/api';
import entityExtractor from '../services/EntityExtractor';

const MemoryGraph = () => {
    const [history, setHistory] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const username = localStorage.getItem('username') || 'Guest';

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getHistory(username);
                setHistory(data);
                
                const allEntities = [];
                data.forEach(item => {
                    const text = item.resultText || item.sourceText || '';
                    const extracted = entityExtractor.extract(text);
                    extracted.forEach(e => {
                        allEntities.push({ ...e, sourceId: item.id, sourceTitle: item.type });
                    });
                });
                
                // Group by unique text
                const grouped = allEntities.reduce((acc, curr) => {
                    const existing = acc.find(a => a.text === curr.text);
                    if (existing) {
                        existing.occurrences.push({ id: curr.sourceId, title: curr.sourceTitle });
                    } else {
                        acc.push({ ...curr, occurrences: [{ id: curr.sourceId, title: curr.sourceTitle }] });
                    }
                    return acc;
                }, []);
                
                setEntities(grouped);
            } catch (err) {
                console.error('Failed to load memory', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [username]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'person': return 'bg-blue-500';
            case 'location': return 'bg-emerald-500';
            case 'date': return 'bg-amber-500';
            default: return 'bg-purple-500';
        }
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center animate-pulse text-blue-500 font-black">SCANNING NEURAL MEMORY...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="text-center lg:text-left space-y-2">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Neural Memory Graph
                </h1>
                <p className="text-slate-500 font-medium italic">Witness the semantic associations extracted from your history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8">
                {/* Graph Area */}
                <div className="relative min-h-[600px] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
                    
                    <div className="relative z-10 p-12 flex flex-wrap gap-8 justify-center items-center">
                        {entities.length === 0 && (
                            <div className="text-center space-y-4 opacity-30 mt-20">
                                <span className="text-8xl">🕸️</span>
                                <p className="font-black uppercase tracking-widest text-xs">No semantic memories found yet</p>
                            </div>
                        )}
                        
                        {entities.map((ent, idx) => (
                            <button
                                key={ent.id}
                                onClick={() => setSelectedEntity(ent)}
                                className={`group/node relative p-6 rounded-3xl shadow-xl transition-all duration-500 hover:scale-110 active:scale-95 border-b-4 
                                    ${selectedEntity?.id === ent.id ? 'scale-125 z-50 ring-4 ring-blue-500/20' : 'hover:z-20'} 
                                    ${getTypeColor(ent.type)} text-white border-black/10`}
                                style={{
                                    marginTop: idx % 2 === 0 ? '40px' : '0',
                                    animation: `float ${3 + (idx % 3)}s ease-in-out infinite`
                                }}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 block">{ent.type}</span>
                                <span className="text-lg font-black">{ent.text}</span>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                                    {ent.occurrences.length}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-700 h-full">
                        {selectedEntity ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg ${getTypeColor(selectedEntity.type)}`}>
                                        {selectedEntity.type === 'person' ? '👤' : selectedEntity.type === 'location' ? '📍' : '📅'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black">{selectedEntity.text}</h2>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{selectedEntity.type} Entity</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connected Documents</p>
                                    <div className="space-y-2">
                                        {selectedEntity.occurrences.map((occ, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/20 transition-all">
                                                <span className="text-lg">📄</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">{occ.title} Record</p>
                                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">ID: {occ.id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                    <p className="text-[10px] text-blue-500 font-medium leading-relaxed italic">
                                        This entity was semantically connected across multiple sessions, showing persistent neural resonance in your memory graph.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 py-20">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-3xl">🎚️</div>
                                <p className="text-xs font-black uppercase tracking-widest leading-loose">Select a semantic node<br/>to view associations</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            ` }} />
        </div>
    );
};

export default MemoryGraph;
