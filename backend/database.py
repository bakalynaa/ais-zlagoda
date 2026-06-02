import psycopg2
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))