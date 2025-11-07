import sqlite3

def get_db():
    conn = sqlite3.connect("instance/database.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        jobFile TEXT,
        resumeFile TEXT,
        atsScore INTEGER,
        keywordMatch INTEGER,
        skillMatch INTEGER,
        readability INTEGER,
        formatScore INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
    )
    """)
    conn.commit()
    conn.close()
