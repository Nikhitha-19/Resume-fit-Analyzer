# backend/app.py
import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pdfplumber
import docx
import spacy
import sqlite3
from database import get_db, init_db

# ---------- Config ----------
UPLOAD_ROOT = os.environ.get("UPLOAD_FOLDER", "uploads")
JD_FOLDER = os.path.join(UPLOAD_ROOT, "jd")
RESUME_FOLDER = os.path.join(UPLOAD_ROOT, "resume")
ALLOWED_EXT = {".pdf", ".docx"}

# backend app
app = Flask(__name__)

# Security / runtime config
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///instance/app.db")
app.config["UPLOAD_FOLDER"] = UPLOAD_ROOT
app.config["MAX_CONTENT_LENGTH"] = int(os.environ.get("MAX_CONTENT_LENGTH", 8 * 1024 * 1024))  # 8 MB default

# CORS: in prod restrict origins (set FRONTEND_URL env var), default allow all for local dev
frontend_url = os.environ.get("FRONTEND_URL", "*")
if frontend_url == "*":
    CORS(app)
else:
    CORS(app, origins=[frontend_url])

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load spaCy model (ensure model installed in env)
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    logger.error("spaCy model load failed: %s", e)
    raise

# prepare upload folders
os.makedirs(JD_FOLDER, exist_ok=True)
os.makedirs(RESUME_FOLDER, exist_ok=True)

# initialize database (should be idempotent)
init_db()

# ---------- Helpers ----------
def allowed_file(filename):
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXT

def extract_text(file_path):
    if file_path.endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            return " ".join(page.extract_text() or "" for page in pdf.pages)
    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        return " ".join(p.text for p in doc.paragraphs)
    return ""

def analyze_resume(resume_text, jd_text):
    resume_doc = nlp((resume_text or "").lower())
    jd_doc = nlp((jd_text or "").lower())

    resume_tokens = set([token.lemma_ for token in resume_doc if token.is_alpha])
    jd_tokens = set([token.lemma_ for token in jd_doc if token.is_alpha])

    keyword_match = (len(resume_tokens & jd_tokens) / len(jd_tokens) * 100) if jd_tokens else 0
    skill_match = min(100, keyword_match + 10)
    readability = max(30, 100 - len(resume_text or "") / 1500)
    format_score = 90 if "experience" in (resume_text or "").lower() else 70
    overall = int((keyword_match + skill_match + readability + format_score) / 4)

    return {
        "overall": overall,
        "keyword": int(keyword_match),
        "skill": int(skill_match),
        "readability": int(readability),
        "format": int(format_score),
    }

# ---------- Routes ----------
@app.post("/register")
def register():
    data = request.get_json(force=True)
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    conn = get_db()
    try:
        conn.execute("INSERT INTO users (username, password) VALUES (?,?)", (username, password))
        conn.commit()
        return jsonify({"message": "User registered"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409

@app.post("/login")
def login():
    data = request.get_json(force=True)
    username, password = data.get("username"), data.get("password")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    user = get_db().execute("SELECT * FROM users WHERE username=? AND password=?", (username, password)).fetchone()
    if user:
        return jsonify({"userId": user["id"], "message": "Login successful"})
    return jsonify({"error": "Invalid credentials"}), 401

@app.post("/analyze")
def analyze():
    # validate form and files
    userId = request.form.get("userId")
    jd_file = request.files.get("jobFile")
    resume_file = request.files.get("resumeFile")

    if not jd_file or not resume_file:
        return jsonify({"error": "Both jobFile and resumeFile are required"}), 400

    # validate extensions
    if not allowed_file(jd_file.filename) or not allowed_file(resume_file.filename):
        return jsonify({"error": "Unsupported file type. Allowed: .pdf, .docx"}), 400

    # save files securely
    jd_filename = secure_filename(jd_file.filename)
    resume_filename = secure_filename(resume_file.filename)
    jd_path = os.path.join(JD_FOLDER, jd_filename)
    resume_path = os.path.join(RESUME_FOLDER, resume_filename)
    jd_file.save(jd_path)
    resume_file.save(resume_path)

    # extract & analyze
    try:
        jd_text = extract_text(jd_path)
        resume_text = extract_text(resume_path)
        result = analyze_resume(resume_text, jd_text)
    except Exception as e:
        logger.exception("Error during text extraction/analysis: %s", e)
        return jsonify({"error": "Processing failed"}), 500

    # persist analysis
    try:
        conn = get_db()
        conn.execute(
            """INSERT INTO analyses (userId, jobFile, resumeFile, atsScore, keywordMatch, skillMatch, readability, formatScore)
               VALUES (?,?,?,?,?,?,?,?)""",
            (userId, jd_path, resume_path, result["overall"], result["keyword"], result["skill"], result["readability"], result["format"]),
        )
        conn.commit()
    except Exception as e:
        logger.exception("DB insert failed: %s", e)
        return jsonify({"error": "DB error"}), 500

    return jsonify(result)

@app.get("/history/<int:userId>")
def history(userId):
    try:
        data = get_db().execute("SELECT * FROM analyses WHERE userId=? ORDER BY createdAt DESC", (userId,)).fetchall()
        return jsonify([dict(row) for row in data])
    except Exception as e:
        logger.exception("History fetch failed: %s", e)
        return jsonify([]), 500

# ---------- Main ----------
if __name__ == "__main__":
    # For local dev only; production will run with gunicorn
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=(os.environ.get("FLASK_ENV") != "production"))
