#!/usr/bin/env python3
"""
FOOK — Global Offline Variable Income Budgeting
Zero-dependency Python Server & SQLite Local Store
"""

import http.server
import socketserver
import sqlite3
import json
import os
import sys
import mimetypes

PORT = 8080
DB_FILE = os.path.join(os.path.dirname(__file__), "fook_local.db")

def init_sqlite_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            category TEXT NOT NULL,
            notes TEXT,
            client TEXT,
            is_recurring INTEGER DEFAULT 0,
            is_tax_deductible INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

class FookRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "online", "app": "fook", "offline_mode": True}).encode("utf-8"))
            return
            
        if self.path == "/api/transactions":
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transactions ORDER BY date DESC")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rows).encode("utf-8"))
            return

        # Default static file serving
        if self.path == "/" or not os.path.exists(os.path.join(os.path.dirname(__file__), self.path.lstrip("/"))):
            self.path = "/index.html"
            
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/sync":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body)

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            if "transactions" in data:
                for t in data["transactions"]:
                    cursor.execute("""
                        INSERT OR REPLACE INTO transactions 
                        (id, date, type, amount, currency, category, notes, client, is_recurring, is_tax_deductible)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        t["id"], t["date"], t["type"], t["amount"], t["currency"],
                        t["category"], t.get("notes", ""), t.get("client", ""),
                        1 if t.get("isRecurring") else 0,
                        1 if t.get("isTaxDeductible") else 0
                    ))
            
            conn.commit()
            conn.close()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Synced to local SQLite"}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def run(port=PORT):
    init_sqlite_db()
    os.chdir(os.path.dirname(__file__))
    
    for attempt_port in [port, port + 1, port + 2, 8000, 3000, 8088]:
        try:
            with ReusableTCPServer(("", attempt_port), FookRequestHandler) as httpd:
                print(f"==================================================")
                print(f"  fook — Global Variable Income Budgeting")
                print(f"  Local Offline Server running at: http://localhost:{attempt_port}")
                print(f"  SQLite Database: {DB_FILE}")
                print(f"  Zero cloud dependencies • 100% On-Device ML")
                print(f"==================================================")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as e:
            if attempt_port == 8088:
                raise e
            continue

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(port)
