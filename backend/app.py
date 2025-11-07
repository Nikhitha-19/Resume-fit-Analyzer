from flask import Flask, request, jsonify
from flask_cors import CORS
import os, pdfplumber, docx, spacy, sqlite3
from werkzeug.utils import secure_filename
from database import get_db, init_db

app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"] = "uploads"
nlp = spacy.load("en_core_web_sm")

os.makedirs("uploads/jd", exist_ok=True)
os.makedirs("uploads/resume", exist_ok=True)
init_db()

# ---------- Helper Functions ----------
def extract_text(file_path):
    if file_path.endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            return " ".join(page.extract_text() or "" for page in pdf.pages)
    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        return " ".join(p.text for p in doc.paragraphs)
    return ""

def analyze_resume(resume_text, jd_text):
    resume_doc = nlp(resume_text.lower())
    jd_doc = nlp(jd_text.lower())

    resume_tokens = set([token.lemma_ for token in resume_doc if token.is_alpha])
    jd_tokens = set([token.lemma_ for token in jd_doc if token.is_alpha])

    keyword_match = len(resume_tokens & jd_tokens) / len(jd_tokens) * 100 if jd_tokens else 0
    skill_match = min(100, keyword_match + 10)
    readability = max(30, 100 - len(resume_text) / 1500)
    format_score = 90 if "experience" in resume_text.lower() else 70
    overall = int((keyword_match + skill_match + readability + format_score) / 4)

    return {
        "overall": overall,
        "keyword": int(keyword_match),
        "skill": int(skill_match),
        "readability": int(readability),
        "format": int(format_score),
    }

# ---------- AUTH ----------
@app.post("/register")
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    conn = get_db()
    try:
        conn.execute("INSERT INTO users (username, password) VALUES (?,?)", (username, password))
        conn.commit()
        return jsonify({"message": "User registered"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409

@app.post("/login")
def login():
    data = request.get_json()
    username, password = data.get("username"), data.get("password")
    user = get_db().execute("SELECT * FROM users WHERE username=? AND password=?", (username, password)).fetchone()
    if user:
        return jsonify({"userId": user["id"], "message": "Login successful"})
    return jsonify({"error": "Invalid credentials"}), 401

# ---------- UPLOAD & ANALYZE ----------
@app.post("/analyze")
def analyze():
    userId = request.form.get("userId")
    jd_file = request.files.get("jobFile")
    resume_file = request.files.get("resumeFile")

    jd_path = os.path.join("uploads/jd", secure_filename(jd_file.filename))
    resume_path = os.path.join("uploads/resume", secure_filename(resume_file.filename))
    jd_file.save(jd_path)
    resume_file.save(resume_path)

    jd_text = extract_text(jd_path)
    resume_text = extract_text(resume_path)
    result = analyze_resume(resume_text, jd_text)

    conn = get_db()
    conn.execute(
        """INSERT INTO analyses (userId, jobFile, resumeFile, atsScore, keywordMatch, skillMatch, readability, formatScore)
           VALUES (?,?,?,?,?,?,?,?)""",
        (userId, jd_path, resume_path, result["overall"], result["keyword"], result["skill"], result["readability"], result["format"]),
    )
    conn.commit()

    return jsonify(result)

# ---------- HISTORY ----------
@app.get("/history/<int:userId>")
def history(userId):
    data = get_db().execute("SELECT * FROM analyses WHERE userId=? ORDER BY createdAt DESC", (userId,)).fetchall()
    return jsonify([dict(row) for row in data])

# ---------- MAIN ----------
if __name__ == "__main__":
    app.run(debug=True)
