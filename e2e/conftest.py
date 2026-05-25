"""Root conftest.py — adds the e2e directory to sys.path so absolute imports work."""
import sys
from pathlib import Path

# Add e2e/ to sys.path so `from config import ...` and `from page_objects import ...` work
sys.path.insert(0, str(Path(__file__).parent))
