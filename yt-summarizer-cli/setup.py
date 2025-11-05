from setuptools import setup, find_packages

setup(
    name="youtube-summarizer",
    version="0.1.0",
    description="A CLI tool to extract and summarize YouTube video transcripts",
    author="Your Name",
    packages=find_packages(),
    install_requires=[
        "youtube-transcript-api>=0.6.2",
        "openai>=1.0.0",
        "rich>=13.0.0",
    ],
    entry_points={
        "console_scripts": [
            "youtube-summarize=youtube_summarizer.cli:main",
        ],
    },
    python_requires=">=3.8",
    test_suite="tests",
)

