# YouTube Summarizer

A CLI tool that extracts transcripts from YouTube videos and uses an LLM to summarize key insights clearly and accurately.

## Features

- Extract subtitles/transcripts from YouTube videos
- Support for multiple subtitle languages (defaults to English, with override option)
- Automatic fallback to alternative languages if preferred language is unavailable
- LLM-powered summarization with structured output
- Clean, readable terminal output with color formatting
- Comprehensive error handling for invalid URLs, missing transcripts, and API failures

## Installation

### Prerequisites

- Python 3.8 or higher
- OpenAI API key

### Setup

1. Clone or download this repository:
   ```bash
   cd warfeeds
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set your OpenAI API key as an environment variable:
   ```bash
   # On Windows (PowerShell)
   $env:OPENAI_API_KEY="your-api-key-here"
   
   # On Windows (Command Prompt)
   set OPENAI_API_KEY=your-api-key-here
   
   # On Linux/Mac
   export OPENAI_API_KEY="your-api-key-here"
   ```

   Or add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.) for persistence.

4. (Optional) Install the package in development mode:
   ```bash
   pip install -e .
   ```

## Usage

### Basic Usage

```bash
python -m youtube_summarizer.cli --url "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Command-Line Options

- `--url` (required): YouTube video URL
  - Supports various URL formats:
    - `https://www.youtube.com/watch?v=VIDEO_ID`
    - `https://youtu.be/VIDEO_ID`
    - `https://www.youtube.com/embed/VIDEO_ID`

- `--language` (optional): Preferred subtitle language code (default: `en`)
  - Examples: `en`, `es`, `fr`, `de`, `ja`, etc.
  - Automatically falls back to English if specified language is unavailable

- `--model` (optional): LLM model to use (default: `gpt-4o-mini`)
  - Examples: `gpt-4o-mini`, `gpt-4`, `gpt-3.5-turbo`
  - Note: Different models have different pricing and capabilities

- `--raw` (optional): Print transcript only, without summarization
  - Useful for debugging or when you only need the transcript

- `--api-key` (optional): OpenAI API key (defaults to `OPENAI_API_KEY` environment variable)
  - Use this if you prefer passing the key via command line instead of environment variable

### Examples

```bash
# Basic usage with default settings
python -m youtube_summarizer.cli --url "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Specify a different language
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --language es

# Use a different model
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --model gpt-4

# Get raw transcript only
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --raw

# Pass API key via command line
python -m youtube_summarizer.cli --url "https://youtu.be/dQw4w9WgXcQ" --api-key "your-key-here"
```

## Output Format

The summary includes:

1. **Video Title/Topic**: Identified from the transcript
2. **Overall Summary**: 2-3 sentence summary of the video
3. **Key Insights**: Bullet points with:
   - The main insight or takeaway
   - Brief explanation
   - Certainty level (high/medium/low)
4. **Uncertainties**: Any unclear or speculative points mentioned

## Error Handling

The tool handles various error scenarios:

- **Invalid YouTube URLs**: Clear error message with guidance
- **Missing Transcripts**: Informative message if subtitles are disabled
- **Unavailable Videos**: Detection of private or deleted videos
- **API Failures**: Graceful handling of OpenAI API errors
- **Missing Dependencies**: Helpful error messages for missing packages

## Testing

Run the unit tests:

```bash
python -m pytest tests/
```

Or run specific test files:

```bash
python -m pytest tests/test_transcript.py
python -m pytest tests/test_llm_client.py
python -m pytest tests/test_formatter.py
```

## Project Structure

```
warfeeds/
├── youtube_summarizer/
│   ├── __init__.py          # Package initialization
│   ├── cli.py               # CLI entry point
│   ├── transcript.py        # Transcript extraction module
│   ├── llm_client.py        # LLM integration module
│   └── formatter.py         # Output formatting module
├── tests/
│   ├── __init__.py
│   ├── test_transcript.py   # Tests for transcript extraction
│   ├── test_llm_client.py   # Tests for LLM client
│   └── test_formatter.py    # Tests for formatter
├── requirements.txt         # Python dependencies
├── setup.py                 # Package setup configuration
└── README.md                # This file
```

## Dependencies

- `youtube-transcript-api`: For extracting YouTube video transcripts
- `openai`: For LLM API integration
- `rich`: For beautiful terminal output formatting

See `requirements.txt` for specific versions.

## Limitations

- Transcripts are only available for videos that have subtitles enabled
- Some videos may not have transcripts in the requested language
- LLM summarization quality depends on the model used and transcript clarity
- API usage may incur costs depending on your OpenAI plan

## License

This project is provided as-is for educational and personal use.

## Troubleshooting

### "Invalid YouTube URL" error
- Ensure the URL is a valid YouTube video URL
- Try different URL formats (youtube.com/watch, youtu.be, etc.)

### "Transcripts are disabled" error
- The video may not have subtitles available
- Try using `--raw` flag to see if any transcript is available

### "OpenAI API key not provided" error
- Set the `OPENAI_API_KEY` environment variable
- Or use the `--api-key` command-line option

### Module not found errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check that you're running from the correct directory

## Contributing

Contributions are welcome! Please ensure:
- Code follows PEP 8 style guidelines
- Tests are included for new features
- Error handling is comprehensive
- Documentation is updated

