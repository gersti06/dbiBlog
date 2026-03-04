# dbiBlog

![Project Logo/Banner (replace this with your own)](images/banner-placeholder.png)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Node.js](https://img.shields.io/badge/node-18%2B-green)
![Express](https://img.shields.io/badge/express.js-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/mongodb-%23339933.svg?&style=flat&logo=mongodb&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Inhaltsverzeichnis
- [Über das Projekt](#über-das-projekt)
- [Features](#features)
- [Architektur](#architektur)
- [Screenshots](#screenshots)
- [Schnellstart](#schnellstart)
- [API-Übersicht](#api-übersicht)
- [Mitwirken](#mitwirken)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Kontakt](#kontakt)

---

## Über das Projekt

dbiBlog ist eine moderne Blogging-Plattform mit Express, MongoDB und EJS. Sie unterstützt mehrere Nutzer, Kategorien, Kommentare und Markdown-Inhalte.

> #### 🚩 **Kurzdemo/Animation:**
> ![Platzhalter für Demovideo oder GIF](images/demo-placeholder.gif)

---

## Features
- Einfache Nutzerverwaltung
- Verschachtelte Kategorien
- Kommentare & Markdown fähig
- Übersichtlich gegliederte API für Einträge, Nutzer, Kommentare etc.
- EJS-Frontend (kann erweitert/adaptiert werden)

---

## Architektur

```mermaid
flowchart TD
    A[User Browser] -- HTTP --> B(Express.js Webserver)
    B -- EJS Render --> C[EJS Templating Views]
    B -- REST API --> D[API Endpunkte]
    D -- CRUD --> E[(MongoDB)]
    B -- Static Assets --> F((Public Folder))
    F -- JS/CSS/Images --> A
```

---

## Screenshots

> **Hauptseite:**
> ![Platzhalter: Screenshot Startseite](images/screenshot-index-placeholder.png)

> **Blog-Details:**
> ![Platzhalter: Screenshot Detailseite](images/screenshot-detail-placeholder.png)

---

## Schnellstart

```shell
# Repository klonen
$ git clone https://github.com/deinname/dbiBlog.git
$ cd dbiBlog/blog

# Abhängigkeiten installieren
$ npm install

# (Optional) Datenbank seedn
$ npm run seed

# Server starten
$ npm start
```
> Standardmäßig öffnet sich die App auf http://localhost:3000

---

## API-Übersicht

| Methode | Pfad             | Beschreibung           |
|---------|------------------|-----------------------|
| GET     | /                | Blog Übersicht        |
| GET     | /entry/:id       | Detailansicht Eintrag |
| POST    | /entry           | Blogeintrag erstellen |
| ...     | ...              | (Weitere Endpunkte)   |

> Ausführliche API-Doku folgt oder auf Anfrage

---

## Mitwirken

Beiträge und Verbesserungen willkommen! 
Schau dir [CONTRIBUTING.md](CONTRIBUTING.md) und die offenen Issues an oder erstelle einen eigenen Pull Request.

1. Fork das Repo
2. Erstelle einen Feature-Branch (`git checkout -b feature/FooBar`)
3. Committe deine Änderungen (`git commit -m 'Add FooBar'`)
4. Push zum Branch (`git push origin feature/FooBar`)
5. Stelle einen Pull Request!

---

## Roadmap
- [ ] Auth mit OAuth
- [ ] Responsive Redesign
- [ ] Mehrsprachigkeit
- [ ] REST API Docs automatisieren

---

## FAQ

**Wie kann ich einen neuen Nutzer anlegen?**  
Registriere dich über die Web-Oberfläche oder lege direkt in MongoDB einen User an.

**Wie kann ich eigene Kategorien hinzufügen?**  
Über die Admin-Ansicht oder per Datenbank/REST API.

**Wo finde ich weitere Hilfe?**  
[GitHub Issues](https://github.com/deinname/dbiBlog/issues) oder Kontakt unten.

---

## Kontakt

Paul Muster – paul@email.com  
Projekt-Link: [github.com/deinname/dbiBlog](https://github.com/deinname/dbiBlog)

---

> 🚧 **Hinweis:** Alle Bild-/Diagramm-Platzhalter können einfach durch eigene Screenshots oder Illustrationen im Ordner `images/` ersetzt werden.
