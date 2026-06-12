-- SCHÉMA SQL (PostgreSQL)

CREATE TABLE joueurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  nationalite CHAR(2) NOT NULL,
  club_actuel VARCHAR(255),
  poste VARCHAR(10) NOT NULL CHECK (poste IN ('GK', 'DEF', 'MID', 'FWD')),
  age INT,
  buts_saison INT DEFAULT 0,
  buts_carriere INT DEFAULT 0,
  passes_decisives INT DEFAULT 0,
  nombre_matchs INT DEFAULT 0,
  matchs_coupe_monde INT DEFAULT 0,
  selections_nationales INT DEFAULT 0,
  buts_en_selection INT DEFAULT 0,
  pied_dominant VARCHAR(10) CHECK (pied_dominant IN ('Gauche', 'Droit')),
  hauteur_cm INT,
  poids_kg INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clubs_historique (
  id SERIAL PRIMARY KEY,
  joueur_id INT NOT NULL REFERENCES joueurs(id) ON DELETE CASCADE,
  club VARCHAR(255) NOT NULL,
  date_debut INT NOT NULL,
  date_fin INT,
  ordre INT NOT NULL
);

CREATE TABLE palmares (
  id SERIAL PRIMARY KEY,
  joueur_id INT NOT NULL REFERENCES joueurs(id) ON DELETE CASCADE,
  trophee VARCHAR(255) NOT NULL,
  annee INT NOT NULL
);

CREATE TABLE awards (
  id SERIAL PRIMARY KEY,
  joueur_id INT NOT NULL REFERENCES joueurs(id) ON DELETE CASCADE,
  award VARCHAR(255) NOT NULL,
  annee INT NOT NULL
);

-- DONNÉES EXEMPLE

INSERT INTO joueurs (nom, nationalite, club_actuel, poste, age, buts_saison, buts_carriere, passes_decisives, nombre_matchs, matchs_coupe_monde, selections_nationales, buts_en_selection, pied_dominant, hauteur_cm, poids_kg)
VALUES 
  ('Kylian Mbappé', 'FR', 'Real Madrid', 'FWD', 25, 18, 186, 42, 347, 12, 79, 47, 'Droit', 178, 73),
  ('Vinícius Júnior', 'BR', 'Real Madrid', 'FWD', 24, 15, 87, 28, 268, 5, 35, 8, 'Gauche', 176, 72),
  ('Erling Haaland', 'NO', 'Manchester City', 'FWD', 24, 27, 187, 18, 286, 1, 34, 19, 'Droit', 194, 88);

INSERT INTO clubs_historique (joueur_id, club, date_debut, date_fin, ordre)
VALUES 
  (1, 'AS Cannes', 2015, 2016, 1),
  (1, 'AS Monaco', 2016, 2017, 2),
  (1, 'Paris Saint-Germain', 2017, 2021, 3),
  (1, 'Real Madrid', 2021, NULL, 4),
  (2, 'Flamengo', 2018, 2020, 1),
  (2, 'Real Madrid Castilla', 2020, 2021, 2),
  (2, 'Real Madrid', 2021, NULL, 3),
  (3, 'Molde FK', 2015, 2018, 1),
  (3, 'Red Bull Salzburg', 2018, 2019, 2),
  (3, 'Borussia Dortmund', 2019, 2023, 3),
  (3, 'Manchester City', 2023, NULL, 4);

INSERT INTO palmares (joueur_id, trophee, annee)
VALUES 
  (1, 'Ligue des Champions', 2024),
  (1, 'Liga', 2024),
  (1, 'Coupe de France', 2018),
  (2, 'Ligue des Champions', 2024),
  (2, 'Liga', 2024),
  (3, 'Premier League', 2024),
  (3, 'FA Cup', 2023);

INSERT INTO awards (joueur_id, award, annee)
VALUES 
  (1, 'Best FIFA Men''s Player', 2023),
  (1, 'Ballon d''Or', 2022),
  (2, 'UEFA Team of the Year', 2024),
  (3, 'Premier League Player of the Year', 2024);
