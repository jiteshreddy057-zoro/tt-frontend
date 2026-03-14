export const getPhoneticHint = (text: string, lang: string): string => {
    // Simple phonetic mapping for major languages to help pronunciation
    const maps: Record<string, Record<string, string>> = {
        'fra_Latn': {
            'bonjour': '/bɔ̃.ʒuʁ/',
            'merci': '/mɛʁ.si/',
            'chat': '/ʃa/',
            'eau': '/o/',
            'pain': '/pɛ̃/'
        },
        'jpn_Jpan': {
            'こんにちは': '/kon.ni.chi.wa/',
            'ありがとう': '/a.ri.ga.toː/',
            'ねこ': '/ne.ko/'
        },
        'spa_Latn': {
            'hola': '/ˈo.la/',
            'gracias': '/ˈgɾa.sjas/',
            'perro': '/ˈpe.ro/'
        }
    };

    return maps[lang]?.[text.toLowerCase()] || '';
};

export const getDifferenceHeatmap = (expected: string, got: string) => {
    const eWords = expected.toLowerCase().split(' ');
    const gWords = got.toLowerCase().split(' ');
    
    return eWords.map(word => {
        const found = gWords.includes(word);
        return {
            word,
            score: found ? 1 : 0 // 1 = perfect, 0 = missed
        };
    });
};
