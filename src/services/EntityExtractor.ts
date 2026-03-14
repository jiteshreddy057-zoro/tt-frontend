export interface Entity {
    id: string;
    text: string;
    type: 'person' | 'location' | 'date' | 'org';
}

class EntityExtractor {
    extract(text: string): Entity[] {
        const entities: Entity[] = [];
        
        // Simple Names (Capitalized words not at start of sentence)
        const nameRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
        let match;
        while ((match = nameRegex.exec(text)) !== null) {
            if (match.index > 0 && text[match.index - 1] === '.') continue; // Skip start of sentence
            entities.push({ id: `e-${Math.random()}`, text: match[1], type: 'person' });
        }

        // Dates
        const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g;
        while ((match = dateRegex.exec(text)) !== null) {
            entities.push({ id: `e-${Math.random()}`, text: match[1], type: 'date' });
        }

        // Locations (Common markers)
        const locations = ['Paris', 'London', 'Tokyo', 'New York', 'Berlin', 'Rome', 'Madrid', 'Dubai'];
        locations.forEach(loc => {
            if (text.includes(loc)) {
                entities.push({ id: `e-${Math.random()}`, text: loc, type: 'location' });
            }
        });

        // Unique by text
        return entities.filter((v, i, a) => a.findIndex(t => (t.text === v.text)) === i);
    }
}

export default new EntityExtractor();
