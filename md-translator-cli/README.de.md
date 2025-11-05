# md-translator-cli
[Deutsch](./README.de.md) | [English](./README.md) 

Minimal CLI zum Übersetzen einer Markdown-Datei in eine andere Sprache unter Verwendung von OpenAI, während die exakte Markdown-Struktur beibehalten wird. Codeblöcke und Inline-Code bleiben unverändert. Die Ausgabe enthält nur das übersetzte Markdown.

## Anforderungen
- Python 3.9+
- Umgebungsvariable `OPENAI_API_KEY` gesetzt

Optional kann `OPENAI_MODEL` gesetzt werden, um das Standardmodell (`gpt-4o-mini`) zu überschreiben. Jedes aktuelle Chat Completions-Modell sollte funktionieren.

## Installation (bearbeitbar)
```bash
pip install -e .
```

## Verwendung
```bash
translate-md -i input.md -o output.md -l de
```

- `-i, --input`: Pfad zur Eingabe-.md
- `-o, --output`: Pfad zur Ausgabe-.md
- `-l, --target-lang`: Zielsprachencode (z.B. `de`, `en`, `es`)

## Hinweise
- Das Tool segmentiert große Dateien in Abschnitte, ohne eingezäunte Codeblöcke zu teilen, und fügt dann die übersetzten Abschnitte zusammen.
- Der Prompt zwingt strikt: Behalte die Markdown-Struktur bei, ändere keine Codeblöcke oder Inline-Code und gib nur das übersetzte Markdown zurück.
- Der System Prompt kann in der src/translate_md/cli.py Datei editiert werden
