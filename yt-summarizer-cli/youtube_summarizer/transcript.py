"""Module for extracting transcripts from YouTube videos."""

import re
from typing import Optional, List, Dict
from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
    YouTubeRequestFailed,
)


class TranscriptExtractor:
    """Handles extraction of transcripts from YouTube videos."""

    def __init__(self):
        # Create instance of YouTubeTranscriptApi for newer versions (1.2.0+)
        # For older versions, this will work with the class methods
        self.transcript_api = YouTubeTranscriptApi()

    def extract_video_id(self, url: str) -> str:
        """
        Extract video ID from various YouTube URL formats.
        
        Args:
            url: YouTube video URL
            
        Returns:
            Video ID string
            
        Raises:
            ValueError: If URL is invalid or video ID cannot be extracted
        """
        # Handle various YouTube URL formats
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/v\/([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        # Try parsing as direct URL
        parsed = urlparse(url)
        if parsed.netloc and 'youtube' in parsed.netloc.lower():
            params = parse_qs(parsed.query)
            if 'v' in params:
                return params['v'][0]
        
        raise ValueError(f"Invalid YouTube URL: {url}")

    def get_available_languages(self, video_id: str) -> List[Dict[str, str]]:
        """
        Get list of available transcript languages for a video.
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            List of dictionaries with 'code' and 'name' keys
        """
        try:
            # Try new API first (1.2.0+): use .list() method
            try:
                transcript_list = self.transcript_api.list(video_id)
            except AttributeError:
                # Fallback to old API (0.6.2): use static method
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            languages = []
            
            # Get manually created transcripts
            for transcript in transcript_list:
                languages.append({
                    'code': transcript.language_code,
                    'name': transcript.language,
                    'type': 'manual' if not transcript.is_generated else 'generated'
                })
            
            # Get generated transcripts
            try:
                for transcript in transcript_list:
                    if transcript.is_translatable:
                        for translated in transcript.translation_languages:
                            languages.append({
                                'code': translated['language_code'],
                                'name': translated['language'],
                                'type': 'translation'
                            })
            except Exception:
                pass
            
            return languages
        except Exception as e:
            raise ValueError(f"Failed to fetch available languages: {str(e)}")

    def fetch_transcript(
        self, 
        video_id: str, 
        language: str = 'en',
        languages: Optional[List[str]] = None
    ) -> str:
        """
        Fetch transcript for a YouTube video.
        
        Args:
            video_id: YouTube video ID
            language: Preferred language code (default: 'en')
            languages: Fallback languages to try
            
        Returns:
            Transcript text as a single string
            
        Raises:
            ValueError: If transcript cannot be fetched
        """
        if languages is None:
            languages = [language, 'en', 'en-US', 'en-GB']
        
        try:
            # Try new API first (1.2.0+): use .list() method
            try:
                transcript_list = self.transcript_api.list(video_id)
            except AttributeError:
                # Fallback to old API (0.6.2): use static method
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get transcript in preferred language
            for lang in languages:
                try:
                    # Find transcript by iterating through available transcripts
                    # This works for both old and new API versions
                    transcript = None
                    for transcript_info in transcript_list:
                        # Check exact match or language code starts with requested language
                        if (transcript_info.language_code == lang or 
                            transcript_info.language_code.startswith(lang + '-') or
                            lang.startswith(transcript_info.language_code)):
                            transcript = transcript_info
                            break
                    
                    if transcript is None:
                        raise NoTranscriptFound(video_id, [lang], None, None)
                    
                    transcript_data = transcript.fetch()
                    return self._format_transcript(transcript_data)
                except NoTranscriptFound:
                    continue
            
            # If no preferred language found, try any available transcript
            # First try manually created transcripts
            try:
                for transcript_info in transcript_list:
                    if not transcript_info.is_generated:
                        transcript_data = transcript_info.fetch()
                        return self._format_transcript(transcript_data)
            except (NoTranscriptFound, Exception):
                pass
            
            # If no manual transcript, try any generated transcript
            try:
                for transcript_info in transcript_list:
                    if transcript_info.is_generated:
                        transcript_data = transcript_info.fetch()
                        return self._format_transcript(transcript_data)
            except (NoTranscriptFound, Exception):
                pass
            
            # If we reach here, no transcript was found
            raise ValueError(
                f"No transcript found for video {video_id} in any available language."
            )
                
        except TranscriptsDisabled:
            raise ValueError(
                f"Transcripts are disabled for video {video_id}. "
                "This video may not have subtitles available."
            )
        except VideoUnavailable:
            raise ValueError(
                f"Video {video_id} is unavailable. "
                "It may have been deleted or made private."
            )
        except YouTubeRequestFailed as e:
            raise ValueError(
                f"Failed to fetch transcript from YouTube: {str(e)}"
            )
        except Exception as e:
            raise ValueError(f"Unexpected error fetching transcript: {str(e)}")

    def _format_transcript(self, transcript_data: List) -> str:
        """
        Format transcript data into a readable text string.
        
        Args:
            transcript_data: List of transcript entries (dicts or objects with 'text' attribute)
            
        Returns:
            Formatted transcript text
        """
        # Combine all text segments, preserving timing context where useful
        segments = []
        for entry in transcript_data:
            # Handle both dictionary and object formats
            if isinstance(entry, dict):
                text = entry.get('text', '').strip()
            else:
                # Handle object format (FetchedTranscriptSnippet)
                text = getattr(entry, 'text', '').strip()
            
            if text:
                segments.append(text)
        
        return ' '.join(segments)

