# md-translator-cli

Minimal CLI to translate a Markdown file to another language using OpenAI while preserving the exact Markdown structure. Code blocks and inline code are left unchanged. Output contains only the translated Markdown.

## Requirements
- Python 3.9+
- Environment variable `OPENAI_API_KEY` set

Optionally, set `OPENAI_MODEL` to override the default model (`gpt-4o-mini`). Any current Chat Completions model should work.

## Install (editable)
```bash
pip install -e .
```

## Usage
```bash
translate-md -i input.md -o output.md -l de
```

- `-i, --input`: path to input `.md`
- `-o, --output`: path to output `.md`
- `-l, --target-lang`: target language code (e.g., `de`, `en`, `es`)

## Notes
- The tool segments large files into chunks without splitting fenced code blocks, then merges translated chunks.
- The prompt strictly enforces: keep Markdown structure, do not alter code blocks or inline code, and return only translated Markdown.
- The system prompt can be edited in the src/translate_md/cli.py file

