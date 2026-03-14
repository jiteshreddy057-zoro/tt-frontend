export interface CulturalTip {
    title: string;
    advice: string;
    level: 'polite' | 'neutral' | 'informal';
}

const CULTURAL_DATA: Record<string, CulturalTip[]> = {
    'fra_Latn': [
        { title: 'The "Bonjour" Rule', advice: 'Always start interactions with "Bonjour". Not doing so is considered rude.', level: 'polite' },
        { title: 'The "Vous" vs "Tu"', advice: 'Use "Vous" for strangers or superiors. "Tu" is for friends and family.', level: 'polite' }
    ],
    'jpn_Jpan': [
        { title: 'Honorifics', advice: 'Japanese revolves around politeness levels. Your translation might need "Desu/Masu" for strangers.', level: 'polite' },
        { title: 'Bowing Etiquette', advice: 'The depth of a bow reflects the degree of respect. A slight nod is okay for friends.', level: 'neutral' }
    ],
    'deu_Latn': [
        { title: 'Directness', advice: 'German culture values directness and punctuality. Be brief and to the point.', level: 'neutral' },
        { title: 'Titles', advice: 'Use specific titles (Herr/Frau) followed by the surname until invited to use first names.', level: 'polite' }
    ],
    'spa_Latn': [
        { title: 'Personal Space', advice: 'Interactions often involve closer physical proximity than in North America.', level: 'neutral' },
        { title: 'Gestures', advice: 'Spanish culture is highly expressive; hand gestures are a key part of communication.', level: 'neutral' }
    ],
    'ara_Arab': [
        { title: 'The Right Hand', advice: 'Always use your right hand for eating, greeting, or giving items.', level: 'polite' },
        { title: 'Eye Contact', advice: 'Direct eye contact is valued but should be brief between opposite genders.', level: 'neutral' }
    ],
    'zho_Hans': [
        { title: 'Business Cards', advice: 'Present and receive business cards with both hands as a sign of respect.', level: 'polite' },
        { title: 'Mianzi (Face)', advice: 'Avoid public criticism or making someone lose "face" in group settings.', level: 'polite' }
    ]
};

class CulturalEngine {
    getTips(targetLang: string): CulturalTip[] {
        return CULTURAL_DATA[targetLang] || [
            { title: 'Global Etiquette', advice: 'Always be respectful of local customs and traditions.', level: 'neutral' }
        ];
    }

    analyzeTone(text: string): string {
        // Placeholder for semantic tone analysis
        if (text.length > 100) return 'Analytical';
        if (text.includes('!') || text.includes('?')) return 'Inquisitive';
        return 'Neutral';
    }
}

export default new CulturalEngine();
