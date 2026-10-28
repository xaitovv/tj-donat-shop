import sqlite3, secrets, threading
_l = threading.Lock()
db = sqlite3.connect("data.db", check_same_thread=False, isolation_level=None)
db.row_factory = sqlite3.Row
db.executescript("""
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT,lang TEXT DEFAULT 'ru',balance REAL DEFAULT 0,spent REAL DEFAULT 0,ref TEXT,invited_by INTEGER,paid INTEGER DEFAULT 0,bonus REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,uid INTEGER,title TEXT,pid TEXT,price REAL,status TEXT DEFAULT 'pending',ts DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS topups(id INTEGER PRIMARY KEY AUTOINCREMENT,uid INTEGER,amount REAL,status TEXT DEFAULT 'pending',ts DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS fin(id INTEGER PRIMARY KEY AUTOINCREMENT,uid INTEGER,title TEXT,amount REAL,ts DATETIME DEFAULT CURRENT_TIMESTAMP);
""")
def q(sql, a=()):
    with _l: return db.execute(sql, a)
def user(uid, name="", inviter=None):
    u = q("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if not u:
        inv = q("SELECT id FROM users WHERE ref=?", (inviter,)).fetchone() if inviter else None
        inv = inv["id"] if inv and inv["id"] != uid else None
        q("INSERT INTO users(id,name,ref,invited_by) VALUES(?,?,?,?)", (uid, name, secrets.token_urlsafe(6).upper(), inv))
        u = q("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    return u
def buy(uid, title, pid, price):
    """Atomik: balans yetarli bo'lsa yechadi (ikki marta yechilishdan himoya)."""
    with _l:
        db.execute("BEGIN IMMEDIATE")
        r = db.execute("UPDATE users SET balance=balance-?,spent=spent+? WHERE id=? AND balance>=?", (price, price, uid, price))
        if r.rowcount == 0:
            db.execute("ROLLBACK"); return None
        oid = db.execute("INSERT INTO orders(uid,title,pid,price) VALUES(?,?,?,?)", (uid, title, pid, price)).lastrowid
        db.execute("INSERT INTO fin(uid,title,amount) VALUES(?,?,?)", (uid, title, -price))
        db.execute("COMMIT"); return oid
def approve_topup(tid, pct):
    """Faqat 'pending' bo'lsa — bitta to'lov ikki marta qabul qilinmaydi."""
    with _l:
        db.execute("BEGIN IMMEDIATE")
        t = db.execute("SELECT * FROM topups WHERE id=? AND status='pending'", (tid,)).fetchone()
        if not t:
            db.execute("ROLLBACK"); return None
        db.execute("UPDATE topups SET status='done' WHERE id=?", (tid,))
        db.execute("UPDATE users SET balance=balance+? WHERE id=?", (t["amount"], t["uid"]))
        db.execute("INSERT INTO fin(uid,title,amount) VALUES(?,?,?)", (t["uid"], "Top up", t["amount"]))
        u = db.execute("SELECT * FROM users WHERE id=?", (t["uid"],)).fetchone()
        if u["invited_by"] and not u["paid"]:  # bonus faqat birinchi to'lovda
            b = round(t["amount"] * pct / 100, 2)
            db.execute("UPDATE users SET balance=balance+?,bonus=bonus+? WHERE id=?", (b, b, u["invited_by"]))
            db.execute("INSERT INTO fin(uid,title,amount) VALUES(?,?,?)", (u["invited_by"], "Referral bonus", b))
        db.execute("UPDATE users SET paid=1 WHERE id=?", (t["uid"],))
        db.execute("COMMIT"); return t
