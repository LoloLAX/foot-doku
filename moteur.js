// moteur.js — généré automatiquement le 13/06/2026
// Validation des réponses joueur

const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

const POS_FR = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' };
const PLAYERS_DB = raw.map(p => ({
    name:                  p.name,
    birth_country:         p.birth_country,
    nationality_selection: p.national_team_name,
    club_current:          p.current_club_name,
    league_current:        p.current_club_league_name,
    position:              POS_FR[p.position] || p.position,
    caps:                  p.national_caps,
    clubs_historique: [...new Set((p.career_history || []).map(e => e.club_name).filter(Boolean))],
}));

function normaliserNom(nom) {
    return nom.toLowerCase()
        .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e')
        .replace(/[ìíîï]/g,'i').replace(/[òóôõö]/g,'o')
        .replace(/[ùúûü]/g,'u').replace(/[ñ]/g,'n')
        .replace(/[ç]/g,'c').replace(/[ž]/g,'z')
        .replace(/[š]/g,'s').replace(/ø/g,'o')
        .replace(/æ/g,'ae').replace(/[^a-z\s'-]/g,'').trim();
}

function trouverJoueur(nom) {
    const q = normaliserNom(nom);
    return PLAYERS_DB.find(j => {
        const n = normaliserNom(j.name);
        if (n === q) return true;
        // match nom de famille
        const parts = n.split(' ');
        if (parts[parts.length - 1] === q) return true;
        // contient la query
        if (n.includes(q) || q.includes(n.split(' ').pop())) return true;
        return false;
    });
}

function _nameLetters(name) { return name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().split('').filter(l => /[A-Z]/.test(l)); }

function matchesContrainte(j, c) {
    if (!c) return false;
    if (c.includes(' OU '))      return c.split(' OU ').some(p => matchesContrainte(j, p.trim()));
    if (c.startsWith('Ex-'))     return j.clubs_historique.includes(c.slice(3));
    if (c.startsWith('Né en '))  return j.birth_country === c.slice(6);
    if (c.startsWith('Lettre ')) return _nameLetters(j.name).includes(c.slice(7));
    if (c === '50+ sélections')      return (j.caps || 0) >= 50;
    if (c === '100+ sélections')     return (j.caps || 0) >= 100;
    if (c === '10+ buts sélection')  return (j.goals_selection || 0) >= 10;
    if (c === '30+ buts sélection')  return (j.goals_selection || 0) >= 30;
    if (c === 'Moins de 23 ans')     return j.age !== null && j.age < 23;
    if (c === '30 ans ou plus')      return j.age !== null && j.age >= 30;
    return j.club_current === c || j.league_current === c
        || j.nationality_selection === c || j.position === c;
}

function verifierReponse(nomJoueur, contrainteLigne, contrainteColonne) {
    const j = trouverJoueur(nomJoueur);
    if (!j) return { succes: false, message: 'Joueur introuvable.' };

    if (matchesContrainte(j, contrainteLigne) && matchesContrainte(j, contrainteColonne)) {
        return { succes: true, message: '✅ ' + j.name + ' (' + j.nationality_selection + ') — ' + j.club_current, joueur: j };
    }
    return { succes: false, message: '❌ ' + j.name + ' ne satisfait pas les deux contraintes.', joueur: j };
}

function getSolutions(l, c) {
    return PLAYERS_DB.filter(j => matchesContrainte(j, l) && matchesContrainte(j, c));
}

module.exports = { verifierReponse, matchesContrainte, getSolutions, PLAYERS_DB };

// --- TEST ---
if (require.main === module) {
    console.log(verifierReponse("Mbappé",     "Real Madrid",          "France"));
    console.log(verifierReponse("Haaland",    "Premier League",       "Norway"));
    console.log(verifierReponse("Thuram",     "Ex-Paris Saint-Germain", "France"));
    console.log(verifierReponse("Griezmann",  "Ex-Atletico Madrid",   "Né en France"));
    console.log(verifierReponse("Lamine Yamal","La Liga",             "Spain"));
}
