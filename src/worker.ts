const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

async function translateText(text: string, srcLang: string, tgtLang: string): Promise<string> {
    const langPair = `${srcLang}|${tgtLang}`;
    const lines = text.split('\n');
    const translatedLines: string[] = [];

    for (const line of lines) {
        if (!line.trim()) {
            translatedLines.push(line);
            continue;
        }

        const segments = splitIntoSegments(line, 450);

        for (const segment of segments) {
            const url = `${MYMEMORY_API}?q=${encodeURIComponent(segment)}&langpair=${encodeURIComponent(langPair)}`;
            let data;
            try {
                const cache = await caches.open('translation-cache-v1');
                const cachedResponse = await cache.match(url);
                if (cachedResponse) {
                    data = await cachedResponse.json();
                } else {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
                    }
                    await cache.put(url, response.clone());
                    data = await response.json();
                }
            } catch (cacheErr) {
                // Fallback if cache API fails
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
                }
                data = await response.json();
            }

            if (data.responseStatus === 200) {
                translatedLines.push(data.responseData.translatedText);
            } else {
                throw new Error(data.responseDetails || 'Translation failed');
            }
        }
    }

    return translatedLines.join('\n').replace(/\n{3,}/g, '\n\n');
}

function splitIntoSegments(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];
    const segments: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let current = '';
    for (const sentence of sentences) {
        if ((current + ' ' + sentence).trim().length > maxLen && current) {
            segments.push(current.trim());
            current = sentence;
        } else {
            current = current ? current + ' ' + sentence : sentence;
        }
    }
    if (current.trim()) segments.push(current.trim());
    return segments;
}

self.addEventListener('message', async (event) => {
    const { text, src_lang, tgt_lang } = event.data;
    try {
        self.postMessage({ status: 'initiate' });
        const translatedText = await translateText(text, src_lang, tgt_lang);
        const output = [{ translation_text: translatedText }];
        self.postMessage({
            status: 'complete',
            output: output,
        });
    } catch (e: any) {
        self.postMessage({ status: 'error', error: e?.message || String(e) });
    }
});
