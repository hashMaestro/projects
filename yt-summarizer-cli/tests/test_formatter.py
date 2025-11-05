"""Unit tests for output formatter module."""

import unittest
from unittest.mock import Mock, patch

from youtube_summarizer.formatter import OutputFormatter


class TestOutputFormatter(unittest.TestCase):
    """Test cases for OutputFormatter."""

    def setUp(self):
        """Set up test fixtures."""
        self.formatter = OutputFormatter(use_color=False)

    def test_print_transcript(self):
        """Test printing transcript."""
        transcript = "This is a test transcript."
        # Just verify no exception is raised
        try:
            self.formatter.print_transcript(transcript)
        except Exception as e:
            self.fail(f"print_transcript raised {e} unexpectedly")

    def test_print_summary_structured(self):
        """Test printing structured summary."""
        summary_data = {
            "title": "Test Video",
            "summary": "This is a test summary.",
            "key_insights": [
                {
                    "insight": "Key insight 1",
                    "explanation": "Explanation 1",
                    "certainty": "high"
                }
            ],
            "uncertainties": ["Uncertain point 1"]
        }
        # Just verify no exception is raised
        try:
            self.formatter.print_summary(summary_data)
        except Exception as e:
            self.fail(f"print_summary raised {e} unexpectedly")

    def test_print_summary_text_format(self):
        """Test printing text format summary."""
        summary_data = {
            "format": "text",
            "summary": "This is a text summary."
        }
        # Just verify no exception is raised
        try:
            self.formatter.print_summary(summary_data)
        except Exception as e:
            self.fail(f"print_summary raised {e} unexpectedly")

    def test_print_summary_string(self):
        """Test printing string summary."""
        summary_data = "This is a plain text summary."
        # Just verify no exception is raised
        try:
            self.formatter.print_summary(summary_data)
        except Exception as e:
            self.fail(f"print_summary raised {e} unexpectedly")

    def test_print_error(self):
        """Test printing error message."""
        # Just verify no exception is raised
        try:
            self.formatter.print_error("Test error", "Test details")
        except Exception as e:
            self.fail(f"print_error raised {e} unexpectedly")

    def test_print_info(self):
        """Test printing info message."""
        # Just verify no exception is raised
        try:
            self.formatter.print_info("Test info")
        except Exception as e:
            self.fail(f"print_info raised {e} unexpectedly")


if __name__ == "__main__":
    unittest.main()

