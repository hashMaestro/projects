"""Module for LLM integration and summarization."""

import os
from typing import Optional, Dict, Any
import json

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class LLMClient:
    """Handles LLM API calls for summarization."""

    def __init__(self, model: str = "gpt-4o-mini", api_key: Optional[str] = None):
        """
        Initialize LLM client.
        
        Args:
            model: Model name to use (default: gpt-4o-mini)
            api_key: API key (if None, will try to get from environment)
        """
        self.model = model
        if not OPENAI_AVAILABLE:
            raise ImportError(
                "OpenAI package not installed. Install with: pip install openai"
            )
        
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "OpenAI API key not provided. Set OPENAI_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        self.client = OpenAI(api_key=self.api_key)

    def summarize(
        self, 
        transcript: str, 
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Summarize transcript using LLM.
        
        Args:
            transcript: Video transcript text
            max_tokens: Maximum tokens for response
            
        Returns:
            Dictionary with summary data
            
        Raises:
            ValueError: If API call fails
        """
        prompt = self._build_prompt(transcript)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that summarizes video transcripts. "
                                 "You provide factual, objective summaries with key insights. "
                                 "You indicate uncertainty when information is unclear."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for more factual output
                max_tokens=max_tokens,
            )
            
            summary_text = response.choices[0].message.content
            
            # Try to parse as JSON if structured, otherwise return as text
            try:
                return json.loads(summary_text)
            except json.JSONDecodeError:
                # If not JSON, return as text summary
                return {
                    "summary": summary_text,
                    "format": "text"
                }
                
        except Exception as e:
            raise ValueError(f"LLM API call failed: {str(e)}")

    def _build_prompt(self, transcript: str) -> str:
        """
        Build prompt for LLM summarization.
        
        Args:
            transcript: Video transcript text
            
        Returns:
            Formatted prompt string
        """
        # Truncate transcript if too long (keep within token limits)
        max_transcript_length = 15000  # Characters, approximate
        
        if len(transcript) > max_transcript_length:
            transcript = transcript[:max_transcript_length] + "\n\n[Transcript truncated...]"
        
        prompt = f"""Please analyze the following video transcript and provide a structured summary with key insights.

Requirements:
1. Be factual and avoid hallucination - only summarize what is actually in the transcript
2. Identify the most important insights and takeaways
3. Provide brief explanations for each takeaway
4. Indicate uncertainty if information is unclear or speculative
5. Use a neutral and objective tone
6. Format the response as a JSON object with the following structure:
{{
  "title": "Brief title or topic of the video",
  "key_insights": [
    {{
      "insight": "Key insight or takeaway",
      "explanation": "Brief explanation",
      "certainty": "high|medium|low"
    }}
  ],
  "summary": "Overall summary paragraph (2-3 sentences)",
  "uncertainties": ["List any unclear or speculative points mentioned"]
}}

If you cannot provide a structured JSON response, provide a clear text summary with bullet points.

Transcript:
{transcript}

Provide your analysis:"""
        
        return prompt

