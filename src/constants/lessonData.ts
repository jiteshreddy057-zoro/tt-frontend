export const SKILLS = [
  "Basics 1", "Basics 2", "Food & Drink", "Animals", "Family",
  "Plurals", "Clothing", "Colors", "Directions", "Verbs: Present",
  "Abstract Objects", "Communication", "Time & Date", "Emotions",
  "Nature", "Hobbies", "Occupations", "Health", "Education",
  "Travel 1", "Travel 2", "Shopping", "Technology", "History",
  "Politics", "Philosophy", "Arts & Culture", "Business", "Science"
];

export const DAILY_THEMES = [
  "Daily Routine", "Common Objects", "Nature", "Social Media", "Shopping"
];

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', icon: '🌿' },
  { id: 'advanced', label: 'Advanced', icon: '🌳' }
];

export const VOCAB_SEEDS: Record<string, Record<string, (string | { word: string, icon: string })[]>> = {
  "Basics 1": {
    beginner: [
      { word: "Hello", icon: "👋" }, { word: "Yes", icon: "✅" }, { word: "No", icon: "❌" }, 
      { word: "Please", icon: "🙏" }, { word: "Thanks", icon: "✨" }, { word: "Water", icon: "💧" }
    ],
    intermediate: [
      { word: "Welcome", icon: "🤝" }, { word: "Goodbye", icon: "👋" }, { word: "Excuse me", icon: "🙋" }, 
      { word: "Sorry", icon: "😔" }, { word: "Bread", icon: "🍞" }, { word: "Milk", icon: "🥛" }
    ],
    advanced: [
      { word: "Congratulations", icon: "🎉" }, { word: "Appreciation", icon: "❤️" }, 
      { word: "Assistance", icon: "🆘" }, { word: "Grateful", icon: "🙏" }
    ]
  },
  "Food & Drink": {
    beginner: [
      { word: "Apple", icon: "🍎" }, { word: "Bread", icon: "🍞" }, { word: "Water", icon: "💧" }, 
      { word: "Milk", icon: "🥛" }, { word: "Coffee", icon: "☕" }, { word: "Tea", icon: "🍵" }
    ],
    intermediate: [
      { word: "Cheese", icon: "🧀" }, { word: "Chicken", icon: "🍗" }, { word: "Pasta", icon: "🍝" }, 
      { word: "Salad", icon: "🥗" }, { word: "Breakfast", icon: "🍳" }, { word: "Dinner", icon: "🍽️" }
    ],
    advanced: [
      { word: "Delicious", icon: "😋" }, { word: "Ingredient", icon: "🧂" }, 
      { word: "Nutrition", icon: "🍎" }, { word: "Restaurant", icon: "🏪" }
    ]
  },
  "Animals": {
    beginner: [
      { word: "Dog", icon: "🐶" }, { word: "Cat", icon: "🐱" }, { word: "Bird", icon: "🐦" }, 
      { word: "Fish", icon: "🐟" }, { word: "Horse", icon: "🐴" }, { word: "Cow", icon: "🐮" }
    ],
    intermediate: [
      { word: "Lion", icon: "🦁" }, { word: "Tiger", icon: "🐯" }, { word: "Elephant", icon: "🐘" }, 
      { word: "Monkey", icon: "🐒" }, { word: "Snake", icon: "🐍" }, { word: "Spider", icon: "🕷️" }
    ],
    advanced: [
      { word: "Predator", icon: "🦈" }, { word: "Species", icon: "🧬" }, 
      { word: "Habitat", icon: "🏡" }, { word: "Wilderness", icon: "🏞️" }
    ]
  },
  "Nature": {
    beginner: [
      { word: "Tree", icon: "🌳" }, { word: "Flower", icon: "🌻" }, { word: "Sun", icon: "☀️" }, 
      { word: "Moon", icon: "🌙" }, { word: "Star", icon: "⭐" }, { word: "Sky", icon: "☁️" }
    ],
    intermediate: [
      { word: "Mountain", icon: "⛰️" }, { word: "Forest", icon: "🌲" }, { word: "River", icon: "🌊" }, 
      { word: "Ocean", icon: "🌊" }, { word: "Weather", icon: "☁️" }, { word: "Storm", icon: "⛈️" }
    ],
    advanced: [
      { word: "Environment", icon: "🌍" }, { word: "Ecosystem", icon: "🌿" }, 
      { word: "Geography", icon: "🗺️" }, { word: "Atmosphere", icon: "☁️" }
    ]
  },
  "Family": {
    beginner: [
      { word: "Mother", icon: "👩" }, { word: "Father", icon: "👨" }, { word: "Brother", icon: "👦" }, 
      { word: "Sister", icon: "👧" }, { word: "Baby", icon: "👶" }, { word: "Family", icon: "👨‍👩‍👧‍👦" }
    ],
    intermediate: [
      { word: "Grandmother", icon: "👵" }, { word: "Grandfather", icon: "👴" }, 
      { word: "Cousin", icon: "👥" }, { word: "Aunt", icon: "👩‍💼" }, { word: "Uncle", icon: "👨‍💼" }
    ],
    advanced: [
      { word: "Relationship", icon: "🤝" }, { word: "Heritage", icon: "🏛️" }, 
      { word: "Generation", icon: "⏳" }, { word: "Sibling", icon: "👦👧" }
    ]
  },
  "Verbs: Present": {
    beginner: [
      { word: "Run", icon: "🏃" }, { word: "Walk", icon: "🚶" }, { word: "Sleep", icon: "😴" }, 
      { word: "Talk", icon: "🗣️" }, { word: "See", icon: "👁️" }, { word: "Hear", icon: "👂" }
    ],
    intermediate: [
      { word: "Thinking", icon: "🤔" }, { word: "Helping", icon: "🤝" }, 
      { word: "Learning", icon: "📚" }, { word: "Traveling", icon: "✈️" }
    ],
    advanced: [
      { word: "Analyzing", icon: "📊" }, { word: "Synthesizing", icon: "🧪" }, 
      { word: "Collaborating", icon: "🤝" }
    ]
  },
  "Education": {
    beginner: [
      { word: "School", icon: "🏫" }, { word: "Book", icon: "📖" }, { word: "Pen", icon: "🖊️" }, 
      { word: "Paper", icon: "📄" }, { word: "Library", icon: "📚" }
    ],
    intermediate: [
      { word: "University", icon: "🏫" }, { word: "Degree", icon: "📜" }, 
      { word: "Scholarship", icon: "💰" }, { word: "Assignment", icon: "📝" }
    ],
    advanced: [
      { word: "Pedagogy", icon: "🎓" }, { word: "Dissertation", icon: "📑" }, 
      { word: "Tenure", icon: "🏛️" }, { word: "Syllabus", icon: "📋" }
    ]
  },
  "Health": {
    beginner: [
      { word: "Doctor", icon: "👨‍⚕️" }, { word: "Hospital", icon: "🏥" }, 
      { word: "Sick", icon: "🤒" }, { word: "Medicine", icon: "💊" }, { word: "Health", icon: "🍎" }
    ],
    intermediate: [
      { word: "Patient", icon: "🛌" }, { word: "Symptom", icon: "🌡️" }, 
      { word: "Diagnosis", icon: "📋" }, { word: "Vaccine", icon: "💉" }
    ],
    advanced: [
      { word: "Epidemiology", icon: "📊" }, { word: "Prescription", icon: "📝" }, 
      { word: "Psychology", icon: "🧠" }
    ]
  },
  "Politics": {
    beginner: [
      { word: "Vote", icon: "🗳️" }, { word: "Law", icon: "⚖️" }, 
      { word: "Government", icon: "🏛️" }, { word: "Leader", icon: "🤴" }
    ],
    intermediate: [
      { word: "Election", icon: "🗳️" }, { word: "Parliament", icon: "🏛️" }, 
      { word: "Democracy", icon: "🗳️" }, { word: "Legislation", icon: "📜" }
    ],
    advanced: [
      { word: "Sovereignty", icon: "👑" }, { word: "Diplomacy", icon: "🤝" }, 
      { word: "Geopolitics", icon: "🌍" }, { word: "Ideology", icon: "🧠" }
    ]
  },
  "Technology": {
    beginner: [
      { word: "Computer", icon: "💻" }, { word: "Phone", icon: "📱" }, 
      { word: "Internet", icon: "🌐" }, { word: "Screen", icon: "🖥️" }
    ],
    intermediate: [
      { word: "Software", icon: "💿" }, { word: "Hardware", icon: "🔌" }, 
      { word: "Database", icon: "🗄️" }, { word: "Algorithm", icon: "🧮" }
    ],
    advanced: [
      { word: "Artificial Intelligence", icon: "🤖" }, { word: "Blockchain", icon: "⛓️" }, 
      { word: "Automation", icon: "🦾" }, { word: "Cryptography", icon: "🔐" }
    ]
  }
};

export const COMMON_PHRASES: Record<string, string[]> = {
  beginner: ["How are you?", "My name is...", "Where is...?", "I am hungry", "I am happy"],
  intermediate: ["I would like a glass of water", "Where is the nearest bank?", "How much does this cost?", "I don't understand"],
  advanced: ["Could you please explain this concept?", "I'm looking forward to meeting you", "It's a pleasure to be here", "What do you recommend?"]
};

export const XP_PER_CORRECT = 10;
export const XP_PER_LESSON_COMPLETE = 50; 
