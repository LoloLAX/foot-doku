// separate_al_ahly.js — Séparer Al Ahly (Égypte) de Al Ahly (Arabie Saoudite)
// Usage : node separate_al_ahly.js

const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

// Séparer Al Ahly par LIGUE (pas nationalité)
const separated = raw.map(p => {
    let club = p.current_club_name;
    let careerHistory = p.career_history || [];

    // Si c'est Al Ahly et joue en Ligue saoudienne
    if (club === 'Al Ahly' && p.current_club_league_name === 'Saudi Arabia') {
        club = 'Al Ahly Saudi';
    }

    // Pareil pour l'historique
    careerHistory = careerHistory.map(entry => {
        let clubName = entry.club_name;
        // On ne peut pas vérifier la ligue du passé, donc on laisse l'historique tel quel
        // (les clubs historiques ne sont pas des constraints actives)
        return { ...entry, club_name: clubName };
    });

    return {
        ...p,
        current_club_name: club,
        career_history: careerHistory
    };
});

fs.writeFileSync('./players_wc2026.json', JSON.stringify(separated, null, 2), 'utf-8');
console.log('✅ Al Ahly séparés');
console.log('   Égypte : Al Ahly');
console.log('   Arabie Saoudite : Al Ahly Saudi');
