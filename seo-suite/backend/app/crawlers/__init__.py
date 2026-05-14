"""
Crawler subsystem.

Pipeline: frontier → fetcher → renderer (optional) → parser → extractor → writer.
Each stage is its own module so they can scale to dedicated workers.
"""
