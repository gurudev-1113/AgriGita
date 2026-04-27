import sys
import os

# Ensure the backend directory is in the path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the actual Flask app from backend/app.py
try:
    from app import app
except ImportError:
    # Fallback for different environments
    from backend.app import app

if __name__ == "__main__":
    app.run()
