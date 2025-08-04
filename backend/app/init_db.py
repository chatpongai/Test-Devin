from sqlalchemy import create_engine
from database import Base, DATABASE_URL
from models import Department

def create_tables():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()
