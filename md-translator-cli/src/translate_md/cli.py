import argparse
import os
import sys
import time
from typing import List

from openai import OpenAI


SYSTEM_PROMPT = (
    "Du bist ein Übersetzer für Markdown. Bewahre die Markdown-Struktur exakt, "
    "übersetze nur natürlichen Text und behalte den Sprachstil bei. Verändere KEINEN Code (Triple-Backticks) und KEIN Inline-Code (Backticks). "
    "Gib ausschließlich den übersetzten Markdown-Text zurück, ohne Kommentare oder Erklärungen."
)

# Fallback-safe chunk size in characters to avoid token limits, while keeping performance reasonable.
# We avoid splitting inside fenced code blocks.
MAX_CHARS_PER_CHUNK = 8000


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="translate-md",
        description="Translate a Markdown file to a target language using OpenAI, preserving formatting.",
    )
    parser.add_argument("-i", "--input", required=True, help="Path to input .md file")
    parser.add_argument("-o", "--output", required=True, help="Path to output .md file")
    parser.add_argument("-l", "--target-lang", required=True, help="Target language code (e.g., de, en, es)")
    return parser.parse_args()


def load_markdown(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def split_markdown_into_chunks(md_text: str, max_chars: int = MAX_CHARS_PER_CHUNK) -> List[str]:
    lines = md_text.splitlines(keepends=True)
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0
    in_fenced_code = False
    fence_marker = None  # "```" or "~~~"

    def flush_current():
        nonlocal current, current_len
        if current:
            chunks.append("".join(current))
            current = []
            current_len = 0

    for line in lines:
        stripped = line.lstrip()
        # Detect start/end of fenced code blocks. Support ``` and ~~~ fences, with optional language tag
        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = "```" if stripped.startswith("```") else "~~~"
            if not in_fenced_code:
                in_fenced_code = True
                fence_marker = marker
            elif fence_marker == marker:
                in_fenced_code = False
                fence_marker = None

        # If adding this line would exceed the max size and we're not inside a code block, flush
        line_len = len(line)
        if not in_fenced_code and current_len + line_len > max_chars:
            flush_current()

        current.append(line)
        current_len += line_len

    flush_current()
    return chunks if chunks else [md_text]


def openai_client_from_env() -> OpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: Environment variable OPENAI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)
    return OpenAI(api_key=api_key)


def translate_chunk(client: OpenAI, chunk: str, target_lang: str, model: str) -> str:
    user_prompt = (
        "Übersetze den folgenden Markdown-Text in die Zielsprache. Erhalte die Markdown-Struktur exakt. "
        "Verändere keine Codeblöcke oder Inline-Code. Gib nur den übersetzten Markdown-Text zurück, "
        "ohne Kommentare oder Erklärungen.\n\n"
        f"Zielsprache: {target_lang}\n\n"
        "<markdown>\n" + chunk + "\n</markdown>"
    )

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )

    content = response.choices[0].message.content or ""
    return content


def translate_markdown(md_text: str, target_lang: str, model: str) -> str:
    client = openai_client_from_env()
    chunks = split_markdown_into_chunks(md_text)
    outputs: List[str] = []

    # Simple retry policy for transient errors
    for chunk in chunks:
        attempt = 0
        backoff = 1.0
        while True:
            try:
                outputs.append(translate_chunk(client, chunk, target_lang, model))
                break
            except Exception as exc:  # noqa: BLE001 - broad to keep CLI minimal
                attempt += 1
                if attempt >= 5:
                    raise
                time.sleep(backoff)
                backoff = min(backoff * 2, 10.0)

    return "".join(outputs)


def write_output(path: str, content: str) -> None:
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(content)


def main() -> None:
    args = parse_args()

    input_path = args.input
    output_path = args.output
    target_lang = args.target_lang

    if not os.path.isfile(input_path):
        print(f"ERROR: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        md_text = load_markdown(input_path)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: Failed to read input file: {exc}", file=sys.stderr)
        sys.exit(1)

    # Choose a sensible default current ChatCompletion model; user can edit here if needed.
    # Using a lightweight model name for speed/cost by default.
    default_model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    try:
        translated = translate_markdown(md_text, target_lang, default_model)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: Translation failed: {exc}", file=sys.stderr)
        sys.exit(1)

    try:
        write_output(output_path, translated)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: Failed to write output file: {exc}", file=sys.stderr)
        sys.exit(1)

    # Minimal CLI: no extra output on success


if __name__ == "__main__":
    main()


