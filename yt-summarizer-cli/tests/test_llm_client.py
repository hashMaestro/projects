"""Unit tests for LLM client module."""

import unittest
from unittest.mock import Mock, patch, MagicMock
import os

from youtube_summarizer.llm_client import LLMClient


class TestLLMClient(unittest.TestCase):
    """Test cases for LLMClient."""

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch('youtube_summarizer.llm_client.OpenAI')
    def test_init_with_env_key(self, mock_openai):
        """Test initialization with environment variable API key."""
        client = LLMClient(model="gpt-4o-mini")
        self.assertEqual(client.model, "gpt-4o-mini")
        self.assertEqual(client.api_key, "test-key")
        mock_openai.assert_called_once_with(api_key="test-key")

    @patch('youtube_summarizer.llm_client.OpenAI')
    def test_init_with_provided_key(self, mock_openai):
        """Test initialization with provided API key."""
        client = LLMClient(model="gpt-4", api_key="provided-key")
        self.assertEqual(client.api_key, "provided-key")
        mock_openai.assert_called_once_with(api_key="provided-key")

    @patch.dict(os.environ, {}, clear=True)
    def test_init_no_api_key(self):
        """Test that missing API key raises ValueError."""
        with self.assertRaises(ValueError):
            LLMClient()

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch('youtube_summarizer.llm_client.OpenAI')
    def test_build_prompt(self, mock_openai):
        """Test prompt building."""
        client = LLMClient()
        transcript = "This is a test transcript."
        prompt = client._build_prompt(transcript)
        
        self.assertIn("transcript", prompt.lower())
        self.assertIn(transcript, prompt)

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch('youtube_summarizer.llm_client.OpenAI')
    def test_build_prompt_truncates_long_transcript(self, mock_openai):
        """Test that long transcripts are truncated."""
        client = LLMClient()
        long_transcript = "A" * 20000  # Longer than max_transcript_length
        prompt = client._build_prompt(long_transcript)
        
        self.assertIn("[Transcript truncated...]", prompt)
        self.assertLess(len(prompt), len(long_transcript) + 1000)

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch('youtube_summarizer.llm_client.OpenAI')
    def test_summarize_success(self, mock_openai_class):
        """Test successful summarization."""
        # Mock OpenAI client
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        # Mock response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"summary": "Test summary"}'
        mock_client.chat.completions.create.return_value = mock_response
        
        client = LLMClient()
        result = client.summarize("Test transcript")
        
        self.assertIn("summary", result)
        mock_client.chat.completions.create.assert_called_once()

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch('youtube_summarizer.llm_client.OpenAI')
    def test_summarize_text_response(self, mock_openai_class):
        """Test handling of text response (non-JSON)."""
        # Mock OpenAI client
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        # Mock response with plain text
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "This is a plain text summary"
        mock_client.chat.completions.create.return_value = mock_response
        
        client = LLMClient()
        result = client.summarize("Test transcript")
        
        self.assertIn("summary", result)
        self.assertEqual(result["format"], "text")


if __name__ == "__main__":
    unittest.main()

