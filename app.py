import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

# Import the actual Flask app from the backend folder
from app import app

if __name__ == "__main__":
    app.run()
