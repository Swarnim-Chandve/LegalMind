"""
Run once to create all database tables.
Run from backend/: python scripts/init_db.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database.connection import engine
from database.models import Base

Base.metadata.create_all(bind=engine)
print("Database initialized successfully")
