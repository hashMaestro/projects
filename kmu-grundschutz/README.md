# KMU-Grundschutz: AI-gestützter Grundschutz-Assistent für KMUs (PoC)

## Status: Proof of Concept (PoC) & Archiviert

Dieses Projekt wurde als spontanes **Nebenprojekt** begonnen, um die Machbarkeit eines KI-gestützten Tools zur Vereinfachung des BSI-Grundschutzes für kleine und mittlere Unternehmen (KMUs) zu testen.

Es handelt sich um einen Proof of Concept (PoC), der die Kernkonzepte validiert, aber nicht aktiv weiterentwickelt wird und **keine** produktionsreife Anwendung darstellt.

**Entwicklungshinweis:** Die initiale Code-Basis wurde unter anderem mithilfe des KI-gestützten Code-Editors **Cursor** erstellt, um schnelle Prototyping-Ergebnisse zu erzielen.

***

## Projektidee und Problemstellung

Viele KMUs stehen vor der Herausforderung, ihre IT-Sicherheit systematisch aufzubauen, da sie oft weder das Budget für externe Berater noch das interne Fachpersonal für komplexe Frameworks besitzen. Meine Idee überbrückt diese Lücke, indem er den standardisierten BSI-Grundschutz in einfache, AI-begleitete Playbooks überführt. So können die User ihre Cybersecurity kosteneffizient und unter Anleitung selber einrichten.

Gleichzeitig bietet das Tool eine aktuelle Risikobewertung basierend auf der dynamischen Bedrohungslage um Awareness für IT-Sicherheit zu schaffen.

***

## Kern-Features

### 1. KI-gestützter Grundschutz-Wizard & Playbooks

Das Herzstück des Tools ist ein interaktiver Wizard, der Anwender durch die grundlegenden Sicherheitsmaßnahmen führt.

* **BSI-Grundschutz-Abbildung:** Die Maßnahmenkataloge basieren auf einer selektiven und vereinfachten Untermenge der BSI-Grundschutz-Bausteine, die für KMU-Grundschutz relevant sind (z.B. Bausteine zum IT-Sicherheitsmanagement, zur Basissicherung der IT-Systeme).
* **Schritt-für-Schritt-Anleitung:** Der AI-Wizard hilft dem Nutzer, die notwendigen organisatorischen und technischen Maßnahmen zu verstehen und umzusetzen.
* **Retrieval & Guardrails:** Der Wizard antwortet nur auf Basis von strengen Regeln und eingeschränkten, offiziellen Quellen um Halluzinationen zu vermeiden und volle Nachvollziehbarkeit und Transparenz zu gewährleisten.
* **Individuelle Hilfes:** Der User kann bei Durchführung der Maßnahmen Rückfragen an den Wizard stellen, wobei sich der Wizard an festgelegten Playbooks orientiert um den Fortschritt der Umsetzung beizubehalten.
* **Fortschrittstracking:** Übersichtliches Dashboard zur Visualisierung des aktuellen Implementierungsgrads der Grundschutz-Maßnahmen.

### 2. Dynamic Threat Intelligence und Schutz-Score

Dieses Feature verknüpft die statischen Grundschutz-Maßnahmen mit der aktuellen Cyber-Bedrohungslage.

* **Aktuelles News-Pulling:** Automatisiertes Pullen von Cybersecurity-Newsfeeds, Schwachstellen-Datenbanken und Threat-Intelligence-Quellen (RSS/API).
* **KI-Analyse & Empfehlungs-Ableitung:** Eine KI-Komponente analysiert die aktuellen Bedrohungsberichte und leitet daraus konkrete Sicherheitsmaßnahmen auf BSI-Grundschutz-Basis ab.
* **Abgleich mit Grundschutz-Bibliothek:** Die abgeleiteten Empfehlungen werden automatisch mit den bereits umgesetzten Grundschutz-Maßnahmen des Nutzers abgeglichen.
* **Echtzeit-Schutz-Score:** Das System berechnet dynamisch einen prozentualen Schutz-Score, der angibt, zu welchem Grad der Nutzer gegen die jeweilige Bedrohungen (die eine zugehörige Grundschutz-Maßnahme erfordern) geschützt ist.

***

## Tech Stack 

Der Prototyp wurde mit Fokus auf gängige, moderne Web-Technologien entwickelt.

`Python` - `Next.js` - `Typescript` - `Postgres` - `Docker`

***

## Schnellstart (Entwicklung)

1. .env erstellen (siehe .env.example)
2. Docker starten:

   ```bash
   docker compose up --build
   ```

3. Pipeline manuell starten (alternativ via Scheduler im Container):

   ```bash
   docker compose exec backend python -m kmu_digest.pipeline
   ```

Konfiguration

- Siehe `backend/kmu_digest/config.py` und `.env.example`.
- Kritische Variablen: Datenquellen, OpenAI/LLM-Keys (optional), DB-URL, Exportpfade.
