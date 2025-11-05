"""Unit tests for transcript extraction module."""

import unittest
from unittest.mock import Mock, patch, MagicMock

from youtube_summarizer.transcript import TranscriptExtractor


class TestTranscriptExtractor(unittest.TestCase):
    """Test cases for TranscriptExtractor."""

    def setUp(self):
        """Set up test fixtures."""
        self.extractor = TranscriptExtractor()

    def test_extract_video_id_standard_url(self):
        """Test extracting video ID from standard YouTube URL."""
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        video_id = self.extractor.extract_video_id(url)
        self.assertEqual(video_id, "dQw4w9WgXcQ")

    def test_extract_video_id_short_url(self):
        """Test extracting video ID from short YouTube URL."""
        url = "https://youtu.be/dQw4w9WgXcQ"
        video_id = self.extractor.extract_video_id(url)
        self.assertEqual(video_id, "dQw4w9WgXcQ")

    def test_extract_video_id_embed_url(self):
        """Test extracting video ID from embed URL."""
        url = "https://www.youtube.com/embed/dQw4w9WgXcQ"
        video_id = self.extractor.extract_video_id(url)
        self.assertEqual(video_id, "dQw4w9WgXcQ")

    def test_extract_video_id_with_params(self):
        """Test extracting video ID from URL with additional parameters."""
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s"
        video_id = self.extractor.extract_video_id(url)
        self.assertEqual(video_id, "dQw4w9WgXcQ")

    def test_extract_video_id_invalid_url(self):
        """Test that invalid URL raises ValueError."""
        url = "https://example.com/video"
        with self.assertRaises(ValueError):
            self.extractor.extract_video_id(url)

    def test_format_transcript(self):
        """Test transcript formatting."""
        transcript_data = [
            {"text": "Hello", "start": 0.0, "duration": 1.0},
            {"text": "world", "start": 1.0, "duration": 1.0},
            {"text": "!", "start": 2.0, "duration": 0.5},
        ]
        formatted = self.extractor._format_transcript(transcript_data)
        self.assertEqual(formatted, "Hello world !")

    def test_format_transcript_empty(self):
        """Test formatting empty transcript."""
        transcript_data = []
        formatted = self.extractor._format_transcript(transcript_data)
        self.assertEqual(formatted, "")

    def test_format_transcript_with_empty_segments(self):
        """Test formatting transcript with empty segments."""
        transcript_data = [
            {"text": "Hello", "start": 0.0},
            {"text": "", "start": 1.0},
            {"text": "world", "start": 2.0},
        ]
        formatted = self.extractor._format_transcript(transcript_data)
        self.assertEqual(formatted, "Hello world")

    @patch('youtube_summarizer.transcript.YouTubeTranscriptApi')
    def test_fetch_transcript_success(self, mock_api):
        """Test successful transcript fetching."""
        # Mock transcript data
        mock_transcript = MagicMock()
        mock_transcript.fetch.return_value = [
            {"text": "Hello", "start": 0.0},
            {"text": "world", "start": 1.0},
        ]
        
        mock_transcript_list = MagicMock()
        mock_transcript_list.find_transcript.return_value = mock_transcript
        mock_api.list_transcripts.return_value = mock_transcript_list
        
        extractor = TranscriptExtractor()
        result = extractor.fetch_transcript("test_video_id", language="en")
        
        self.assertEqual(result, "Hello world")
        mock_api.list_transcripts.assert_called_once_with("test_video_id")

    @patch('youtube_summarizer.transcript.YouTubeTranscriptApi')
    def test_fetch_transcript_no_transcript_found(self, mock_api):
        """Test handling when no transcript is found."""
        from youtube_transcript_api._errors import NoTranscriptFound
        
        mock_transcript_list = MagicMock()
        mock_transcript_list.find_transcript.side_effect = NoTranscriptFound(
            "test_video_id", ["en"], None, None
        )
        mock_api.list_transcripts.return_value = mock_transcript_list
        
        extractor = TranscriptExtractor()
        with self.assertRaises(ValueError):
            extractor.fetch_transcript("test_video_id", language="en")


if __name__ == "__main__":
    unittest.main()

