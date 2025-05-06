import pandas as pd
import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Read CSV
df = pd.read_csv("vibecheck2/db/tunes/songs_template.csv")  # Make sure this is in backend/ or use full path

# Connect to DB
conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

cursor = conn.cursor()

# Insert each row
for _, row in df.iterrows():
    cursor.execute("""
        INSERT INTO songs (song_name, genre, mood, pace, duration_minutes, file_url)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        row['song_name'],
        row['genre'],
        row['mood'],
        row['pace'],
        row['duration_minutes'],
        row['file_url']
    ))

conn.commit()
cursor.close()
conn.close()

print("✅ Songs inserted successfully.")
