#!/usr/bin/env python3
"""
Lightweight local server for Orbit (Goals, Habits & Tasks Organizer).
- Serves index.html, styles.css, and app.js on http://localhost:8000
- Provides zero-dependency SQLite (.sqlite) export & import endpoints
  using Python's built-in sqlite3 module.
"""

import json
import os
import sqlite3
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Personal',
    color TEXT DEFAULT '#4f46e5',
    target_date TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    progress_mode TEXT DEFAULT 'auto',
    manual_progress INTEGER DEFAULT 0,
    created_at TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    goal_id TEXT DEFAULT '',
    frequency_type TEXT DEFAULT 'daily',
    custom_days_json TEXT DEFAULT '[1,3,5]',
    times_per_week INTEGER DEFAULT 3,
    color TEXT DEFAULT '#10b981',
    archived INTEGER DEFAULT 0,
    created_at TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS habit_completions (
    habit_id TEXT NOT NULL,
    completed_date TEXT NOT NULL,
    PRIMARY KEY (habit_id, completed_date),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    goal_id TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    due_date TEXT DEFAULT '',
    is_focus INTEGER DEFAULT 0,
    recurrence TEXT DEFAULT 'none',
    tags_json TEXT DEFAULT '[]',
    completed_at TEXT,
    created_at TEXT DEFAULT ''
);
"""


def state_to_sqlite_bytes(data: dict) -> bytes:
    fd, tmp_path = tempfile.mkstemp(suffix=".sqlite")
    os.close(fd)
    try:
        conn = sqlite3.connect(tmp_path)
        with conn:
            conn.executescript(SCHEMA_SQL)

            for g in data.get("goals", []):
                conn.execute(
                    """INSERT OR REPLACE INTO goals
                       (id, title, description, category, color, target_date, status, progress_mode, manual_progress, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        g.get("id", ""),
                        g.get("title", ""),
                        g.get("description", ""),
                        g.get("category", "Personal"),
                        g.get("color", "#4f46e5"),
                        g.get("targetDate", ""),
                        g.get("status", "active"),
                        g.get("progressMode", "auto"),
                        int(g.get("manualProgress", 0)),
                        g.get("createdAt", ""),
                    ),
                )
                for idx, ms in enumerate(g.get("milestones", [])):
                    conn.execute(
                        """INSERT OR REPLACE INTO milestones
                           (id, goal_id, title, completed, sort_order)
                           VALUES (?, ?, ?, ?, ?)""",
                        (
                            ms.get("id", f"{g.get('id')}_ms_{idx}"),
                            g.get("id", ""),
                            ms.get("title", ""),
                            1 if ms.get("completed") else 0,
                            idx,
                        ),
                    )

            for h in data.get("habits", []):
                conn.execute(
                    """INSERT OR REPLACE INTO habits
                       (id, title, description, goal_id, frequency_type, custom_days_json, times_per_week, color, archived, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        h.get("id", ""),
                        h.get("title", ""),
                        h.get("description", ""),
                        h.get("goalId", ""),
                        h.get("frequencyType", "daily"),
                        json.dumps(h.get("customDays", [1, 3, 5])),
                        int(h.get("timesPerWeek", 3)),
                        h.get("color", "#10b981"),
                        1 if h.get("archived") else 0,
                        h.get("createdAt", ""),
                    ),
                )
                for dt_str in h.get("completions", []):
                    conn.execute(
                        "INSERT OR IGNORE INTO habit_completions (habit_id, completed_date) VALUES (?, ?)",
                        (h.get("id", ""), str(dt_str)),
                    )

            for t in data.get("tasks", []):
                conn.execute(
                    """INSERT OR REPLACE INTO tasks
                       (id, title, notes, goal_id, priority, status, due_date, is_focus, recurrence, tags_json, completed_at, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        t.get("id", ""),
                        t.get("title", ""),
                        t.get("notes", ""),
                        t.get("goalId", ""),
                        t.get("priority", "medium"),
                        t.get("status", "todo"),
                        t.get("dueDate", ""),
                        1 if t.get("isFocus") else 0,
                        t.get("recurrence", "none"),
                        json.dumps(t.get("tags", [])),
                        t.get("completedAt"),
                        t.get("createdAt", ""),
                    ),
                )
        conn.close()
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def sqlite_bytes_to_state(raw_bytes: bytes) -> dict:
    fd, tmp_path = tempfile.mkstemp(suffix=".sqlite")
    os.close(fd)
    try:
        with open(tmp_path, "wb") as f:
            f.write(raw_bytes)
        conn = sqlite3.connect(tmp_path)
        conn.row_factory = sqlite3.Row

        goals = []
        for row in conn.execute("SELECT * FROM goals"):
            ms_rows = conn.execute(
                "SELECT * FROM milestones WHERE goal_id = ? ORDER BY sort_order ASC", (row["id"],)
            ).fetchall()
            goals.append(
                {
                    "id": row["id"],
                    "title": row["title"],
                    "description": row["description"],
                    "category": row["category"],
                    "color": row["color"],
                    "targetDate": row["target_date"],
                    "status": row["status"],
                    "progressMode": row["progress_mode"],
                    "manualProgress": row["manual_progress"],
                    "milestones": [
                        {"id": m["id"], "title": m["title"], "completed": bool(m["completed"])}
                        for m in ms_rows
                    ],
                    "createdAt": row["created_at"],
                }
            )

        habits = []
        for row in conn.execute("SELECT * FROM habits"):
            comp_rows = conn.execute(
                "SELECT completed_date FROM habit_completions WHERE habit_id = ? ORDER BY completed_date ASC",
                (row["id"],),
            ).fetchall()
            habits.append(
                {
                    "id": row["id"],
                    "title": row["title"],
                    "description": row["description"],
                    "goalId": row["goal_id"],
                    "frequencyType": row["frequency_type"],
                    "customDays": json.loads(row["custom_days_json"] or "[1,3,5]"),
                    "timesPerWeek": row["times_per_week"],
                    "color": row["color"],
                    "completions": [c["completed_date"] for c in comp_rows],
                    "archived": bool(row["archived"]),
                    "createdAt": row["created_at"],
                }
            )

        tasks = []
        for row in conn.execute("SELECT * FROM tasks"):
            tasks.append(
                {
                    "id": row["id"],
                    "title": row["title"],
                    "notes": row["notes"],
                    "goalId": row["goal_id"],
                    "priority": row["priority"],
                    "status": row["status"],
                    "dueDate": row["due_date"],
                    "isFocus": bool(row["is_focus"]),
                    "recurrence": row["recurrence"],
                    "tags": json.loads(row["tags_json"] or "[]"),
                    "completedAt": row["completed_at"],
                    "createdAt": row["created_at"],
                }
            )

        conn.close()
        return {"version": 1, "goals": goals, "habits": habits, "tasks": tasks}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


class OrbitRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            payload = json.dumps({"ok": True, "sqlite": sqlite3.sqlite_version}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length > 0 else b""

        if self.path == "/api/export-sqlite":
            try:
                data = json.loads(body.decode("utf-8"))
                sqlite_bytes = state_to_sqlite_bytes(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/vnd.sqlite3")
                self.send_header("Content-Length", str(len(sqlite_bytes)))
                self.end_headers()
                self.wfile.write(sqlite_bytes)
            except Exception as exc:
                err = json.dumps({"error": str(exc)}).encode("utf-8")
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err)))
                self.end_headers()
                self.wfile.write(err)
            return

        if self.path == "/api/import-sqlite":
            try:
                parsed = sqlite_bytes_to_state(body)
                out = json.dumps(parsed).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(out)))
                self.end_headers()
                self.wfile.write(out)
            except Exception as exc:
                err = json.dumps({"error": str(exc)}).encode("utf-8")
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err)))
                self.end_headers()
                self.wfile.write(err)
            return

        self.send_error(404, "Endpoint not found")


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer(("0.0.0.0", port), OrbitRequestHandler)
    print(f"Orbit Organizer running at http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()


if __name__ == "__main__":
    main()
