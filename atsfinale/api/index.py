import os
import sys

# --- Serverless NLTK setup ---
# Vercel's filesystem is read-only except /tmp; point NLTK data there.
NLTK_DATA_DIR = "/tmp/nltk_data"
os.makedirs(NLTK_DATA_DIR, exist_ok=True)
os.environ["NLTK_DATA"] = NLTK_DATA_DIR

import nltk
if NLTK_DATA_DIR not in nltk.data.path:
    nltk.data.path.insert(0, NLTK_DATA_DIR)

# Download required NLTK packages on cold start (cached in /tmp on warm invocations)
for pkg in ["punkt", "punkt_tab", "stopwords", "averaged_perceptron_tagger"]:
    try:
        nltk.download(pkg, download_dir=NLTK_DATA_DIR, quiet=True)
    except Exception:
        pass

# Add the parent directory (atsfinale/) to sys.path so we can import ats.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app — Vercel picks up `app` automatically as the ASGI handler
from ats import app  # noqa: E402  (import after path manipulation is intentional)
