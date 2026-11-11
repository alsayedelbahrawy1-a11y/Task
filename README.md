# Orbit — Linked Goals, Habits & Tasks Organizer

A self-contained, browser-based organizer that links **Goals**, **Habits**, and **Tasks** together with automatic browser persistence (`localStorage`) and portable **Lite File** backup/restore (`.json` and `.sqlite`).

## Quick Start

### Option 1: Open Directly in Any Browser (Zero Setup)
Open `index.html` directly in Chrome, Firefox, Safari, or Edge.
- Data saves automatically to browser `localStorage`.
- Export & import lightweight `.json` backup files offline anytime.

### Option 2: Run with Local Server (Enables Native `.sqlite` Export/Import)
Requires only Python 3 (no external packages needed):

```bash
python3 server.py 8000
```

Then open **http://localhost:8000** in your browser. Running via `server.py` unlocks one-click **SQLite (`.sqlite`)** relational database export and import alongside `.json` backups.

## Key Features

- **Today's Focus Dashboard**: Daily habit check-offs, pinned focus & due/overdue tasks, quick task capture bar, active goal momentum, and 7-day upcoming deadlines.
- **Linked Goals**: Categorize goals (`Health`, `Career`, `Learning`, `Finance`, `Personal`, `Creative`), set target dates, add checkable milestones, and track **automatic progress** driven by completed milestones and linked tasks. Click any goal for a deep-dive workspace showing all linked habits and tasks.
- **Habits & Streaks**: Flexible schedules (`Every day`, `Weekdays`, `Specific days of week`, or `Target X times/week`), current & best streak tracking, 30-day consistency rate, interactive 14-day retroactive check-in strip, and a 12-week consistency heatmap.
- **Tasks & Workflow**: Priority levels, due dates, recurring tasks (`daily`, `weekdays`, `weekly`, `monthly` — automatically schedules the next occurrence upon completion), tags, global search, and a toggle between **List View** and drag-and-drop **Kanban Board View**.
- **Browser Storage + Portable Lite Backups**: Real-time `localStorage` persistence with **Replace** or **Merge** import from `.json` or `.sqlite` files, plus Dark/Light mode.
