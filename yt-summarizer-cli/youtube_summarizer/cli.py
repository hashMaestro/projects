"""CLI entry point for YouTube Summarizer."""

import sys
import argparse
from typing import Optional

from youtube_summarizer.transcript import TranscriptExtractor
from youtube_summarizer.llm_client import LLMClient
from youtube_summarizer.formatter import OutputFormatter


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Extract and summarize YouTube video transcripts",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  youtube-summarize --url "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  youtube-summarize --url "https://youtu.be/dQw4w9WgXcQ" --language es
  youtube-summarize --url "https://youtu.be/dQw4w9WgXcQ" --raw
  youtube-summarize --url "https://youtu.be/dQw4w9WgXcQ" --model gpt-4
        """
    )
    
    parser.add_argument(
        "--url",
        type=str,
        required=True,
        help="YouTube video URL"
    )
    
    parser.add_argument(
        "--language",
        type=str,
        default="en",
        help="Preferred subtitle language code (default: en)"
    )
    
    parser.add_argument(
        "--model",
        type=str,
        default="gpt-4o-mini",
        help="LLM model to use (default: gpt-4o-mini)"
    )
    
    parser.add_argument(
        "--raw",
        action="store_true",
        help="Print transcript only, without summarization"
    )
    
    parser.add_argument(
        "--api-key",
        type=str,
        default=None,
        help="OpenAI API key (defaults to OPENAI_API_KEY environment variable)"
    )
    
    return parser.parse_args()


def main():
    """Main CLI entry point."""
    args = parse_arguments()
    formatter = OutputFormatter()
    
    try:
        # Extract transcript
        formatter.print_info("Extracting transcript...")
        extractor = TranscriptExtractor()
        video_id = extractor.extract_video_id(args.url)
        formatter.print_info(f"Video ID: {video_id}")
        
        transcript = extractor.fetch_transcript(video_id, language=args.language)
        
        if args.raw:
            # Print raw transcript only
            formatter.print_transcript(transcript)
            return
        
        # Summarize with LLM
        formatter.print_info("Summarizing with LLM...")
        llm_client = LLMClient(model=args.model, api_key=args.api_key)
        summary = llm_client.summarize(transcript)
        
        # Print formatted summary
        formatter.print_summary(summary, title=args.url)
        
    except ValueError as e:
        formatter.print_error("Invalid input or processing error", str(e))
        sys.exit(1)
    except ImportError as e:
        formatter.print_error("Missing dependency", str(e))
        sys.exit(1)
    except KeyboardInterrupt:
        formatter.print_info("\nOperation cancelled by user")
        sys.exit(130)
    except Exception as e:
        formatter.print_error("Unexpected error", str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()

