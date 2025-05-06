import sys
import os

# Make sure the parent folder (VibeCheck2) is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from db.db_config import get_db_connection
from flask import send_from_directory

from fuzzywuzzy import fuzz
from nltk.tokenize import word_tokenize
import nltk 
from nltk.corpus import stopwords


app = Flask(__name__)
CORS(app)

@app.route('/recommend', methods=['POST'])
def recommend():
    stop_words = set(stopwords.words('english'))
    data = request.json
    prompt = data.get("prompt", "").lower()
    
    if not prompt:
        return jsonify({"error": "Please enter what you're in the mood for."}), 400
    
    # prompt_words = word_tokenize(prompt)
    prompt_words = [w for w in word_tokenize(prompt) if w.lower() not in stop_words]


    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM songs")
        songs = cursor.fetchall()
        cursor.close()
        conn.close()

        def score_song(song):
            full_prompt = " ".join(prompt_words)
            score = 0

            for field in ['genre', 'mood', 'pace', 'song_name']:
                field_value = song.get(field, "")
                if not field_value:
                    continue

                field_lower = field_value.lower()

                # Boost for exact match of field with full prompt
                if field_lower in full_prompt:
                    score += 100

                # Boost for field value being exactly one of the prompt words
                for word in prompt_words:
                    if word == field_lower:
                        score += 50

                # Fuzzy match with full prompt
                score += fuzz.partial_ratio(full_prompt, field_lower) * 0.5

                # Fuzzy match per word
                for word in prompt_words:
                    score += fuzz.partial_ratio(word, field_lower) * 0.3

                print(score)
            return score


        ranked = sorted([s for s in songs if score_song(s) > 80], key=score_song, reverse=True)
        print(ranked)

        return jsonify(ranked[:5])

        

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tunes/<filename>')
def serve_audio(filename):
    return send_from_directory(os.path.abspath('../db/tunes'), filename)

if __name__ == '__main__':
    app.run(debug=True, port=5050)
