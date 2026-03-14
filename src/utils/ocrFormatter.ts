export const arrangeOCRText = (text: string): string => {
    if (!text) return '';
    let processed = text
        .replace(/\s+/g, ' ')
        .replace(/(Step\s+\d+|Phase\s+\d+|[A-Z][a-z]+(\s+[A-Z][a-z]+)*:)/g, '\n$1')
        .replace(/(Pipeline|Workflow|Input|Output|Processing|Storage|Caching|Security|Display)/g, '\n$1');
    const lines = processed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const formattedLines: string[] = [];
    const headerPattern = /^(step|phase|part|section|workflow)\s+\d+|^(introduction|overview|architecture|conclusion|summary|background)$/i;
    const categoryPattern = /^[A-Z][a-z0-9]+(\s+[A-Z][a-z0-9]+)*:$/;
    const itemPattern = /^\s*[\-\•\*]\s*/;
    lines.forEach((line) => {
        if (headerPattern.test(line)) {
            formattedLines.push(`\n# ${line.replace(/^#+\s*/, '')}`);
        }
        else if (categoryPattern.test(line) || /^(Pipeline|Processing|Storage|Caching|Security|Display)$/i.test(line)) {
            formattedLines.push(`\n## ${line}`);
        }
        else if (itemPattern.test(line)) {
            formattedLines.push(`- ${line.replace(itemPattern, '')}`);
        }
        else if (line.length < 60 && !line.includes('.')) {
            formattedLines.push(`- ${line}`);
        }
        else {
            formattedLines.push(line);
        }
    });
    return formattedLines.join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

