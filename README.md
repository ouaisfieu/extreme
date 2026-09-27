# Extrêmes — Observatoire des radicalités politiques

Site statique, francophone, non partisan et sourcé sur les extrêmes droites et les extrêmes gauches dans le monde (idéologies, partis, élections 2024-2026, violence politique, réponses démocratiques).

**En ligne :** https://ouaisfieu.github.io/extreme/

- 31 pages, environ 38 000 mots, 185 sources citées
- Dossiers : extrême droite (6 pages), extrême gauche (6 pages), Belgique, Allemagne, France, États-Unis, comparaison
- Outils : glossaire (55 notions), chronologie (66 dates), répertoire (46 acteurs), penseurs, FAQ, tableau de bord électoral (15 tableaux), bibliographie
- Deux vidéos intégrées (lecteur YouTube sans cookie, chargé au clic)

Textes rédigés par **Claude**, modèle d'IA d'Anthropic, à partir des rapports de recherche du projet et d'une recherche complémentaire à jour au 27 septembre 2026. Éditeur anonyme.

## Aucune étape de build

Chaque page est un fichier HTML complet, lisible sans JavaScript et directement éditable. Il n'y a ni framework, ni dépendance, ni compilation, ni `package.json`.

```
/
├── index.html, *.html        pages (HTML final, éditable à la main)
├── 404.html                  page d'erreur GitHub Pages
├── assets/
│   ├── style.css             feuille de style unique (thèmes clair/sombre)
│   ├── app.js                amélioration progressive : recherche, filtres, tri, thème, vidéos
│   ├── favicon.svg, *.png    icônes et images de partage (Open Graph)
├── data/                     « API » statique JSON + CSV
│   ├── search.json           index de recherche
│   ├── elections.json, *.csv tableaux électoraux
│   ├── chronologie.json/.csv
│   ├── glossaire.json
│   ├── acteurs.json/.csv
│   └── sources.json
├── sitemap.xml               plan du site (avec extensions image et vidéo)
├── feed.xml                  flux Atom
├── llms.txt                  résumé pour agents conversationnels
├── opensearch.xml            moteur de recherche du navigateur
├── manifest.webmanifest      métadonnées d'application web
├── robots.txt, humans.txt, .well-known/security.txt
└── .nojekyll                 désactive Jekyll sur GitHub Pages
```

## Mise en ligne sur GitHub Pages

1. Téléverser le contenu de ce dossier à la racine de la branche `main` du dépôt `ouaisfieu/extreme`.
2. Dans **Settings → Pages**, choisir *Deploy from a branch*, branche `main`, dossier `/ (root)`.
3. Le site est servi à `https://ouaisfieu.github.io/extreme/`.

Pour tester localement : `python3 -m http.server` dans ce dossier, puis ouvrir `http://localhost:8000/` (la recherche charge `data/search.json` et ne fonctionne pas en `file://`).

## Référencement et web sémantique

- Balises `title`, `description`, `canonical`, `hreflang`, Open Graph, Twitter Cards et Dublin Core sur chaque page.
- JSON-LD schema.org en `@graph` : `WebSite` (+ `SearchAction`), `Organization`, `Article`/`ScholarlyArticle` (auteur, dates, `citation`, `about`/`mentions` avec `sameAs` vers Wikipédia, `hasPart`), `BreadcrumbList`, `FAQPage`, `DefinedTermSet`, `Dataset` + `DataCatalog`, `VideoObject`, `ItemList` d'`Event`, `Organization` et `Person`.
- HTML sémantique : `article`, `nav`, `aside`, `figure`, `dfn`, `cite`, `time datetime`, tableaux avec `caption` et `scope`.
- Espaces insécables typographiques françaises, fil d'Ariane, sommaire, liens internes « À lire aussi ».

### À faire après publication

- **Date de mise en ligne des vidéos.** Google exige `uploadDate` pour les résultats enrichis vidéo. Dans `index.html` et `videos.html`, repérer les objets `"@type":"VideoObject"` dans le bloc JSON-LD et ajouter `"uploadDate":"AAAA-MM-JJ"`.
- **Search Console.** Déclarer la propriété `https://ouaisfieu.github.io/extreme/` et soumettre `sitemap.xml`. (Sur un site de projet GitHub Pages, `robots.txt` n'est pas lu par les robots, qui le cherchent à la racine du domaine ; le sitemap doit donc être soumis manuellement.)
- **Domaine personnalisé (optionnel).** Ajouter un fichier `CNAME` et remplacer `https://ouaisfieu.github.io/extreme/` dans les fichiers HTML, XML, JSON et texte.

## Mettre à jour le contenu

Les pages sont du HTML final : on peut corriger un texte directement. Pour une donnée présente à plusieurs endroits (par exemple un résultat électoral), penser à mettre à jour la page concernée, `data/*.json`/`*.csv` et, si besoin, `data/search.json`. Chaque correction datée peut être signalée dans `feed.xml`.

## Licence

Textes et données : [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr). Les sources citées restent la propriété de leurs auteurs. Voir `LICENSE`.
