import eventlet
eventlet.monkey_patch()

import sys
import os

# Import the Flask app from the backend package
from backend.app import app

if __name__ == "__main__":
    app.run()
