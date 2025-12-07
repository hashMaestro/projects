# KMU-Grundschutz: AI-gestützter Grundschutz-Assistent für KMUs (PoC)

## Status: Proof of Concept (PoC) & Archiviert

Dieses Projekt wurde als spontanes **Nebenprojekt** begonnen, um die Machbarkeit eines KI-gestützten Tools zur Vereinfachung des BSI-Grundschutzes für kleine und mittlere Unternehmen (KMUs) zu demonstrieren.

Es handelt sich um einen Proof of Concept (PoC), der die Kernkonzepte validiert, aber nicht aktiv weiterentwickelt wird und **keine** produktionsreife Anwendung darstellt.

**Entwicklungshinweis:** Der initialen Code-Basis wurde mithilfe des KI-gestützten Code-Editors **Cursor** erstellt, um schnelle Prototyping-Ergebnisse zu erzielen.

***

## Projektidee und Problemstellung

Viele KMUs stehen vor der Herausforderung, ihre IT-Sicherheit systematisch aufzubauen, da sie oft weder das Budget für externe Berater noch das interne Fachpersonal für komplexe Frameworks besitzen. Meine Idee überbrückt diese Lücke, indem er den standardisierten BSI-Grundschutz in einfache, AI-begleitete Playbooks überführt.

Gleichzeitig bietet das Tool eine aktuelle Risikobewertung basierend auf der dynamischen Bedrohungslage und dem individuellen Umsetzungs-Status des Users.

***

## Kern-Features

### 1. KI-gestützter Grundschutz-Wizard & Playbooks

Das Herzstück des Tools ist ein interaktiver Wizard, der Anwender durch die grundlegenden Sicherheitsmaßnahmen führt.

* **BSI-Grundschutz-Abbildung:** Die Maßnahmenkataloge basieren auf einer selektiven und vereinfachten Untermenge der BSI-Grundschutz-Bausteine, die für KMU-Grundschutz relevant sind (z.B. Bausteine zum IT-Sicherheitsmanagement, zur Basissicherung der IT-Systeme).
* **Schritt-für-Schritt-Anleitung:** Der AI-Wizard hilft dem Nutzer, die notwendigen organisatorischen und technischen Maßnahmen zu verstehen und umzusetzen.
* **Retrieval & Guardrails:** Der Wizard antwortet nur auf Basis von strengen Regeln und eingeschränkten offiziellen Quellen um Halluzinationen zu vermeiden und Nachvollziehbarkeit zu gewährleisten.
* **Individuelle Hilfes:** Der User kann bei Durchführung der Maßnahmen Rückfragen an den Wizard stellen, wobei sich der Wizard an festgelegten Playbooks orientiert um den Fortschritt der Umsetzung beizubehalten.
* **Fortschrittstracking:** Übersichtliches Dashboard zur Visualisierung des aktuellen Implementierungsgrads der Grundschutz-Maßnahmen.

### 2. Dynamic Threat Intelligence und Schutz-Score

Dieses Feature verknüpft die statischen Grundschutz-Maßnahmen mit der aktuellen Cyber-Bedrohungslage.

* **Aktuelles News-Pulling:** Automatisiertes Pullen von Cybersecurity-Newsfeeds, Schwachstellen-Datenbanken (z.B. NVD/CVEs) und Threat-Intelligence-Quellen.
* **KI-Analyse & Empfehlungs-Ableitung:** Eine KI-Komponente analysiert die aktuellen Bedrohungsberichte und leitet daraus konkrete, Sicherheitsmaßnahmen auf BSI-Grundschutz-Basis ab.
* **Abgleich mit Grundschutz-Bibliothek:** Die abgeleiteten Empfehlungen werden automatisch mit den bereits umgesetzten Grundschutz-Maßnahmen des Nutzers abgeglichen.
* **Echtzeit-Schutz-Score:** Das System berechnet dynamisch einen prozentualen Schutz-Score, der angibt, zu welchem Grad der Nutzer gegen die *aktuell* relevanten und bekannten Bedrohungen (die eine zugehörige Grundschutz-Maßnahme erfordern) geschützt ist.

***

## Tech Stack 

Der Prototyp wurde mit Fokus auf gängige, moderne Web-Technologien entwickelt.

| Komponente | Technologie (Angenommen) | Zweck im PoC |
| :--- | :--- | :--- |
| **Backend** | Python (z.B. Flask/FastAPI) | Verarbeitung von Newsfeeds, KI-Logik, Daten-Mapping. |
| **KI / NLP** | gpt-4o/-mini per OpenAI-API | Textanalyse der News, Ableitung von Handlungsempfehlungen. |
| **Crawler** | Python (z.B. Beautiful Soup, Scrapy) | Aggregation der externen News-Quellen. |
| **Datenbank** | PostgreSQL | Speicherung des Maßnahmenkatalogs und der Nutzerfortschritte. |
| **Frontend** | HTML/CSS/JavaScript (Minimal) | Einfache Benutzeroberfläche zur Demonstration des Wizards und des Scores. |

***

## 🚀 Erste Schritte (Placeholder)

Da es sich um einen PoC handelt, sind die Installationsschritte möglicherweise nur rudimentär vorhanden. Die folgenden Schritte dienen als Anhaltspunkt, wie das Projekt ursprünglich gestartet werden sollte.

1.  **Repository klonen:**
    ```bash
    git clone [IHRE-REPO-URL]
    cd cyberguard-pro
    ```
2.  **Umgebung einrichten:**
    ```bash
    # Beispiel: Erstellen einer virtuellen Umgebung
    python3 -m venv venv
    source venv/bin/activate
    # Notwendige Abhängigkeiten installieren
    pip install -r requirements.txt
    ```
3.  **Starten des Servers:**
    ```bash
    # Starten der Backend-Anwendung
    python app.py
    ```

***
