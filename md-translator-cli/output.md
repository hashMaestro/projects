<markdown>
# YouTube Zusammenfasser

Ein CLI-Tool, das Transkripte aus YouTube-Videos extrahiert und ein LLM verwendet, um wichtige Erkenntnisse klar und genau zusammenzufassen.

## Funktionen

- Extrahieren von Untertiteln/Transkripten aus YouTube-Videos
- Unterstützung für mehrere Untertitelsprache (Standard ist Englisch, mit Überschreibungsoption)
- Automatisches Zurückfallen auf alternative Sprachen, wenn die bevorzugte Sprache nicht verfügbar ist
- LLM-gestützte Zusammenfassung mit strukturiertem Output
- Sauberer, lesbarer Terminal-Output mit Farbformatierung
- Umfassende Fehlerbehandlung für ungültige URLs, fehlende Transkripte und API-Fehler

## Installation

### Voraussetzungen

- Python 3.8 oder höher
- OpenAI API-Schlüssel

### Einrichtung

1. Klonen oder herunterladen Sie dieses Repository:
   ```bash
   cd yt-summarizer-cli
   ```

2. Abhängigkeiten installieren:
   ```bash
   pip install -r requirements.txt
   ```

3. Setzen Sie Ihren OpenAI API-Schlüssel als Umgebungsvariable:
   ```bash
   # Unter Windows (PowerShell)
   $env:OPENAI_API_KEY="your-api-key-here"
   
   # Unter Windows (Eingabeaufforderung)
   set OPENAI_API_KEY=your-api-key-here
   
   # Unter Linux/Mac
   export OPENAI_API_KEY="your-api-key-here"
   ```

   Oder fügen Sie ihn Ihrem Shell-Profil (`~/.bashrc`, `~/.zshrc` usw.) für Persistenz hinzu.


## Verwendung

### Grundlegende Verwendung

```bash
python -m youtube_summarizer.cli --url "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Befehlszeilenoptionen

- `--url` (erforderlich): YouTube-Video-URL
  - Unterstützt verschiedene URL-Formate:
    - `https://www.youtube.com/watch?v=VIDEO_ID`
    - `https://youtu.be/VIDEO_ID`
    - `https://www.youtube.com/embed/VIDEO_ID`

- `--language` (optional): Bevorzugter Untertitelsprache-Code (Standard: `en`)
  - Beispiele: `en`, `es`, `fr`, `de`, `ja` usw.
  - Fällt automatisch auf Englisch zurück, wenn die angegebene Sprache nicht verfügbar ist

- `--model` (optional): Zu verwendendes LLM-Modell (Standard: `gpt-4o-mini`)
  - Beispiele: `gpt-4o-mini`, `gpt-4`, `gpt-3.5-turbo`
  - Hinweis: Verschiedene Modelle haben unterschiedliche Preise und Fähigkeiten

- `--raw` (optional): Nur das Transkript drucken, ohne Zusammenfassung
  - Nützlich für Debugging oder wenn Sie nur das Transkript benötigen

- `--api-key` (optional): OpenAI API-Schlüssel (Standard ist die Umgebungsvariable `OPENAI_API_KEY`)
  - Verwenden Sie dies, wenn Sie den Schlüssel lieber über die Befehlszeile anstelle der Umgebungsvariable übergeben möchten

### Beispiele

```bash
# Grundlegende Verwendung mit Standardeinstellungen
python -m youtube_summarizer.cli --url "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Eine andere Sprache angeben
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --language es

# Ein anderes Modell verwenden
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --model gpt-4

# Nur das rohe Transkript erhalten
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --raw

# API-Schlüssel über die Befehlszeile übergeben
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --api-key "your-key-here"
```

## Ausgabeformat

Die Zusammenfassung umfasst:

1. **Video Titel/Thema**: Aus dem Transkript identifiziert
2. **Gesamtzusammenfassung**: 2-3 Sätze Zusammenfassung des Videos
3. **Wichtige Erkenntnisse**: Aufzählungspunkte mit:
   - Der Hauptinsight oder Erkenntnis
   - Kurze Erklärung
   - Gewissheitsgrad (hoch/mittel/niedrig)
4. **Ungewissheiten**: Alle unklaren oder spekulativen Punkte, die erwähnt werden

Beispiel:
<img width="1182" height="925" alt="image" src="https://github.com/user-attachments/assets/4414b594-b3ed-401a-9239-9ca74eab4f25" />

## Fehlerbehandlung

Das Tool behandelt verschiedene Fehlerszenarien:

- **Ungültige YouTube-URLs**: Klare Fehlermeldung mit Anleitung
- **Fehlende Transkripte**: Informative Nachricht, wenn Untertitel deaktiviert sind
- **Nicht verfügbare Videos**: Erkennung von privaten oder gelöschten Videos
- **API-Fehler**: Anmutige Handhabung von OpenAI API-Fehlern
- **Fehlende Abhängigkeiten**: Hilfreiche Fehlermeldungen für fehlende Pakete

## Testen

Führen Sie die Unit-Tests aus:

```bash
python -m pytest tests/
```

Oder führen Sie spezifische Testdateien aus:

```bash
python -m pytest tests/test_transcript.py
python -m pytest tests/test_llm_client.py
python -m pytest tests/test_formatter.py
```

## Projektstruktur

```
yt-summarizer-cli/
├── youtube_summarizer/
│   ├── __init__.py          # Paketinitialisierung
│   ├── cli.py               # CLI-Einstiegspunkt
│   ├── transcript.py        # Modul zur Transkriptextraktion
│   ├── llm_client.py        # Modul zur LLM-Integration
│   └── formatter.py         # Modul zur Ausgabeformatierung
├── tests/
│   ├── __init__.py
│   ├── test_transcript.py   # Tests zur Transkriptextraktion
│   ├── test_llm_client.py   # Tests für den LLM-Client
│   └── test_formatter.py    # Tests für den Formatter
├── requirements.txt         # Python-Abhängigkeiten
├── setup.py                 # Paketsetup-Konfiguration
└── README.md                # Diese Datei
```

## Abhängigkeiten

- `youtube-transcript-api`: Zum Extrahieren von YouTube-Video-Transkripten
- `openai`: Für die LLM-API-Integration
- `rich`: Für schöne Terminalausgabeformatierung

Siehe `requirements.txt` für spezifische Versionen.

## Einschränkungen

- Transkripte sind nur für Videos verfügbar, die Untertitel aktiviert haben
- Einige Videos haben möglicherweise keine Transkripte in der angeforderten Sprache
- Die Qualität der LLM-Zusammenfassung hängt vom verwendeten Modell und der Klarheit des Transkripts ab
- Die Nutzung der API kann Kosten verursachen, abhängig von Ihrem OpenAI-Plan

## Lizenz

Dieses Projekt wird wie es ist für Bildungs- und persönliche Zwecke bereitgestellt.

## Fehlersuche

### "Ungültige YouTube-URL" Fehler
- Stellen Sie sicher, dass die URL eine gültige YouTube-Video-URL ist
- Versuchen Sie verschiedene URL-Formate (youtube.com/watch, youtu.be usw.)

### "Transkripte sind deaktiviert" Fehler
- Das Video hat möglicherweise keine verfügbaren Untertitel
- Versuchen Sie, das `--raw`-Flag zu verwenden, um zu sehen, ob ein Transkript verfügbar ist

### "OpenAI API-Schlüssel nicht bereitgestellt" Fehler
- Setzen Sie die Umgebungsvariable `OPENAI_API_KEY`
- Oder verwenden Sie die Befehlszeilenoption `--api-key`

### Modul nicht gefunden Fehler
- Stellen Sie sicher, dass alle Abhängigkeiten installiert sind: `pip install -r requirements.txt`
- Überprüfen Sie, ob Sie aus dem richtigen Verzeichnis ausführen

## Mitwirken

Dieses Projekt begann als kleine Idee am späten Abend und wurde schnell mit Hilfe von Cursor zusammengestellt. Es ist nicht beabsichtigt, ein gewartetes oder aktiv entwickeltes Tool zu werden. Aus diesem Grund werden keine Beiträge akzeptiert. Fühlen Sie sich frei, das Repository zu forken, wenn Sie darauf aufbauen möchten.
</markdown>