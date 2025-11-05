"""Module for formatting output."""

from typing import Dict, Any, Optional
import json

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.markdown import Markdown


class OutputFormatter:
    """Handles formatting and display of results."""

    def __init__(self, use_color: bool = True):
        """
        Initialize formatter.
        
        Args:
            use_color: Whether to use colored output
        """
        self.console = Console(force_terminal=use_color)

    def print_transcript(self, transcript: str):
        """
        Print raw transcript.
        
        Args:
            transcript: Transcript text
        """
        self.console.print("\n[bold]Transcript:[/bold]")
        self.console.print(Panel(transcript, border_style="blue"))

    def print_summary(self, summary_data: Dict[str, Any], title: Optional[str] = None):
        """
        Print formatted summary.
        
        Args:
            summary_data: Summary data dictionary
            title: Optional title to display
        """
        if title:
            self.console.print(f"\n[bold cyan]Video:[/bold cyan] {title}\n")
        
        # Handle different response formats
        if isinstance(summary_data, str):
            # Plain text summary
            self.console.print(Markdown(summary_data))
            return
        
        if "format" in summary_data and summary_data["format"] == "text":
            # Text format summary
            self.console.print(Markdown(summary_data.get("summary", "")))
            return
        
        # Structured JSON format
        video_title = summary_data.get("title", "Untitled Video")
        self.console.print(f"\n[bold cyan]Video: {video_title}[/bold cyan]\n")
        
        # Overall summary
        overall_summary = summary_data.get("summary", "")
        if overall_summary:
            self.console.print(Panel(
                overall_summary,
                title="[bold]Summary[/bold]",
                border_style="green"
            ))
        
        # Key insights
        insights = summary_data.get("key_insights", [])
        if insights:
            self.console.print("\n[bold yellow]Key Insights:[/bold yellow]\n")
            
            for i, insight in enumerate(insights, 1):
                insight_text = insight.get("insight", "")
                explanation = insight.get("explanation", "")
                certainty = insight.get("certainty", "medium").lower()
                
                # Color code by certainty
                if certainty == "high":
                    bullet_color = "green"
                elif certainty == "low":
                    bullet_color = "yellow"
                else:
                    bullet_color = "blue"
                
                self.console.print(f"[{bullet_color}]•[/{bullet_color}] [bold]{insight_text}[/bold]")
                if explanation:
                    self.console.print(f"  {explanation}")
                self.console.print()  # Empty line
        
        # Uncertainties
        uncertainties = summary_data.get("uncertainties", [])
        if uncertainties:
            self.console.print("\n[bold yellow]WARNING - Uncertainties:[/bold yellow]\n")
            for uncertainty in uncertainties:
                self.console.print(f"[yellow]•[/yellow] {uncertainty}")
            self.console.print()

    def print_error(self, message: str, details: Optional[str] = None):
        """
        Print error message.
        
        Args:
            message: Error message
            details: Optional detailed error information
        """
        self.console.print(f"\n[bold red]Error:[/bold red] {message}")
        if details:
            self.console.print(f"[red]{details}[/red]")

    def print_info(self, message: str):
        """
        Print info message.
        
        Args:
            message: Info message
        """
        self.console.print(f"[blue]INFO:[/blue] {message}")

