"""
WSGI entry point for the Flask application
"""
from app import app, init_databases

# Initialize databases on startup
init_databases()
print("Databases initialized successfully!")

# Export app for Gunicorn
application = app

if __name__ == "__main__":
    app.run()

