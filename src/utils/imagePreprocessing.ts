export const preprocessImageForOCR = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = 2;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(imageSrc);
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let r_sum = 0, g_sum = 0, b_sum = 0;
            let sampleCount = 0;
            for (let i = 0; i < data.length; i += 40) {
                r_sum += data[i];
                g_sum += data[i + 1];
                b_sum += data[i + 2];
                sampleCount++;
            }
            const avgBrightness = (r_sum + g_sum + b_sum) / (3 * sampleCount);
            const isDarkBackground = avgBrightness < 100;
            const contrast = 75;
            const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                gray = contrastFactor * (gray - 128) + 128;
                if (isDarkBackground) {
                    gray = 255 - gray;
                }
                gray = Math.max(0, Math.min(255, gray));
                if (gray > 200) gray = 255;
                else if (gray < 55) gray = 0;
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            resolve(imageSrc);
        };
        img.src = imageSrc;
    });
};
const KEEP_2CHAR = new Set([
    'a', 'i', 'is', 'in', 'on', 'to', 'of', 'as', 'at', 'by', 'be',
    'do', 'he', 'it', 'we', 'go', 'me', 'no', 'ok', 'up', 'or', 'if',
    'an', 'so', 'my', 'us', 'am',
    'ai', 'h2', 'db', 'ui', 'id', 'ip', 'js', 'ts', 'hi', 'vs',
]);
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
export const cleanOCRText = (text: string): string => {
    if (!text) return '';
    let cleaned = text.replace(/[|~\\=_[\]{}<>\/|+*^$#@`©®™■►▼◄▲◆●★;:,]/g, ' ');
    cleaned = cleaned.replace(/\s[-—–]+\s/g, ' ');
    cleaned = cleaned.replace(/[-—–]{2,}/g, ' ');
    return cleaned
        .split(/\s+/)
        .filter(word => {
            if (!word) return false;
            if (word === '&') return true;
            if (!/[a-zA-Z0-9]/.test(word)) return false;
            const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
            if (!cleanWord) return false;
            const lower = cleanWord.toLowerCase();
            const len = cleanWord.length;
            if (len === 1) return /^[aAiI0-9]$/.test(cleanWord);
            if (len === 2) return KEEP_2CHAR.has(lower);
            if (/^\d{3,}$/.test(cleanWord)) return false;
            if (len <= 4) {
                const vowelCount = [...lower].filter(c => VOWELS.has(c)).length;
                if (vowelCount === 0) return false;
            }
            return true;
        })
        .join(' ')
        .trim();
};

