// normalize_clubs.js — Normaliser les noms de clubs avec variantes
// Usage : node normalize_clubs.js

const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

// Map de normalisation : variante → nom canonique
const CLUB_ALIASES = {
    'Al Ahli': 'Al Ahly',
    'Al-Ahli': 'Al Ahly',
    'Al Ahly': 'Al Ahly',
    'Shabab Al Ahli': 'Shabab Al-Ahli',
    'Shabab Al-Ahli': 'Shabab Al-Ahli',
    // Ajouter d'autres normalizations au besoin
};

function normalizeClub(name) {
    return CLUB_ALIASES[name] || name;
}

// Appliquer la normalisation
const normalized = raw.map(p => ({
    ...p,
    current_club_name: normalizeClub(p.current_club_name),
    career_history: (p.career_history || []).map(entry => ({
        ...entry,
        club_name: normalizeClub(entry.club_name)
    }))
}));

fs.writeFileSync('./players_wc2026.json', JSON.stringify(normalized, null, 2), 'utf-8');
console.log('✅ Clubs normalisés');
console.log('   Al Ahli/Al-Ahli → Al Ahly');
console.log('   Shabab Al Ahli/Al-Ahli → Shabab Al-Ahli');
