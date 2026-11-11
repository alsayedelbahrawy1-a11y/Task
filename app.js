/* Orbit — Linked Goals, Habits & Tasks Organizer */
(function () {
  "use strict";

  const STORAGE_KEY = "orbit_organizer_v1";
  const THEME_KEY = "orbit_theme_v1";

  // --- Utilities ---
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function esc(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatLocalDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function todayStr() {
    return formatLocalDate(new Date());
  }

  function addDaysStr(dateStr, delta) {
    const dt = parseLocalDate(dateStr);
    dt.setDate(dt.getDate() + delta);
    return formatLocalDate(dt);
  }

  function addMonthsStr(dateStr, months) {
    const dt = parseLocalDate(dateStr);
    dt.setMonth(dt.getMonth() + months);
    return formatLocalDate(dt);
  }

  function daysBetween(fromStr, toStr) {
    const a = parseLocalDate(fromStr);
    const b = parseLocalDate(toStr);
    return Math.round((b - a) / 86400000);
  }

  function startOfWeekMonday(dateStr) {
    const dt = parseLocalDate(dateStr);
    const day = dt.getDay(); // 0 Sun .. 6 Sat
    const diff = day === 0 ? -6 : 1 - day;
    dt.setDate(dt.getDate() + diff);
    return formatLocalDate(dt);
  }

  function humanDateLabel(dateStr) {
    if (!dateStr) return "";
    const t = todayStr();
    const diff = daysBetween(t, dateStr);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    const dt = parseLocalDate(dateStr);
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.25s ease";
      setTimeout(() => el.remove(), 260);
    }, 2800);
  }

  // --- Starter Sample Data ---
  function createSampleData() {
    const t = todayStr();
    const gHealth = "goal_sample_health";
    const gCareer = "goal_sample_career";
    const gLearn = "goal_sample_learn";

    const pastCompletionsDaily = [];
    for (let i = 1; i <= 18; i++) {
      if (i !== 6 && i !== 13) pastCompletionsDaily.push(addDaysStr(t, -i));
    }
    const pastCompletionsRun = [
      addDaysStr(t, -1),
      addDaysStr(t, -3),
      addDaysStr(t, -6),
      addDaysStr(t, -8),
      addDaysStr(t, -10),
      addDaysStr(t, -13),
    ];
    const pastCompletionsStudy = [
      t,
      addDaysStr(t, -1),
      addDaysStr(t, -2),
      addDaysStr(t, -3),
      addDaysStr(t, -4),
      addDaysStr(t, -7),
      addDaysStr(t, -8),
    ];

    return {
      version: 1,
      isSample: true,
      updatedAt: new Date().toISOString(),
      goals: [
        {
          id: gHealth,
          title: "Run a 10K Under 50 Minutes",
          description: "Build aerobic endurance, stay injury-free, and hit a personal best in the city 10K.",
          category: "Health",
          color: "#10b981",
          targetDate: addDaysStr(t, 45),
          status: "active",
          progressMode: "auto",
          manualProgress: 40,
          milestones: [
            { id: "ms_1", title: "Comfortable 5K base without stopping", completed: true },
            { id: "ms_2", title: "Complete first 8K long run", completed: true },
            { id: "ms_3", title: "Run 5K time trial under 24:30", completed: false },
            { id: "ms_4", title: "Race day 10K finish < 50:00", completed: false },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: gCareer,
          title: "Launch Personal Portfolio & Case Studies",
          description: "Ship a fast, clean portfolio showcasing 3 flagship projects to unlock senior opportunities.",
          category: "Career",
          color: "#4f46e5",
          targetDate: addDaysStr(t, 21),
          status: "active",
          progressMode: "auto",
          manualProgress: 50,
          milestones: [
            { id: "ms_5", title: "Finalize architecture & wireframe", completed: true },
            { id: "ms_6", title: "Write 3 deep-dive project case studies", completed: false },
            { id: "ms_7", title: "Deploy custom domain & lighthouse 98+ audit", completed: false },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: gLearn,
          title: "Conversational Spanish (B1 Level)",
          description: "Hold natural 30-minute conversations on travel, work, and daily life.",
          category: "Learning",
          color: "#f59e0b",
          targetDate: addDaysStr(t, 75),
          status: "active",
          progressMode: "auto",
          manualProgress: 30,
          milestones: [
            { id: "ms_8", title: "Master top 1,000 core vocabulary words", completed: true },
            { id: "ms_9", title: "Complete 10 live speaking sessions", completed: false },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      habits: [
        {
          id: "hab_sample_1",
          title: "Zone 2 Run / Tempo Session",
          description: "Lace up at 7:00 AM before checking messages",
          goalId: gHealth,
          frequencyType: "times_per_week",
          customDays: [1, 3, 5, 6],
          timesPerWeek: 4,
          color: "#10b981",
          completions: pastCompletionsRun,
          archived: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "hab_sample_2",
          title: "15m Mobility & Core Stretch",
          description: "Evening recovery routine",
          goalId: gHealth,
          frequencyType: "daily",
          customDays: [0, 1, 2, 3, 4, 5, 6],
          timesPerWeek: 7,
          color: "#14b8a6",
          completions: pastCompletionsDaily,
          archived: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "hab_sample_3",
          title: "25m Spanish Flashcards + Audio",
          description: "Right after morning coffee",
          goalId: gLearn,
          frequencyType: "weekdays",
          customDays: [1, 2, 3, 4, 5],
          timesPerWeek: 5,
          color: "#f59e0b",
          completions: pastCompletionsStudy,
          archived: false,
          createdAt: new Date().toISOString(),
        },
      ],
      tasks: [
        {
          id: "tsk_sample_1",
          title: "Draft Case Study #1: Metrics & Architecture Diagram",
          notes: "Include before/after latency benchmarks and key design tradeoffs.",
          goalId: gCareer,
          priority: "high",
          status: "in_progress",
          dueDate: t,
          isFocus: true,
          recurrence: "none",
          tags: ["deep-work", "writing"],
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "tsk_sample_2",
          title: "Register for City 10K Autumn Wave",
          notes: "Early bird closes this week.",
          goalId: gHealth,
          priority: "medium",
          status: "todo",
          dueDate: t,
          isFocus: true,
          recurrence: "none",
          tags: ["admin"],
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "tsk_sample_3",
          title: "Book Friday Spanish iTalki tutor session",
          notes: "Focus on past-tense storytelling.",
          goalId: gLearn,
          priority: "medium",
          status: "todo",
          dueDate: addDaysStr(t, 2),
          isFocus: false,
          recurrence: "weekly",
          tags: ["speaking"],
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "tsk_sample_4",
          title: "Set up responsive typography & dark mode tokens",
          notes: "",
          goalId: gCareer,
          priority: "medium",
          status: "done",
          dueDate: addDaysStr(t, -2),
          isFocus: false,
          recurrence: "none",
          tags: ["design"],
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: "tsk_sample_5",
          title: "Weekly Sunday Review & Plan Priorities",
          notes: "Review goal progress, archive finished items, pick top 3 focus tasks.",
          goalId: "",
          priority: "low",
          status: "todo",
          dueDate: addDaysStr(t, 4),
          isFocus: false,
          recurrence: "weekly",
          tags: ["planning"],
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  // --- Application State ---
  let state = loadState();
  let ui = {
    activeView: "today",
    goalStatusFilter: "all",
    goalCategoryFilter: "all",
    habitFilter: "active",
    habitGoalFilter: "all",
    taskTab: "active",
    taskGoalFilter: "all",
    taskPriorityFilter: "all",
    taskLayout: "list",
    editingMilestones: [],
    activeDetailGoalId: null,
    sqliteAvailable: false,
  };

  function normalizeState(raw) {
    const clean = {
      version: 1,
      isSample: Boolean(raw && raw.isSample),
      updatedAt: (raw && raw.updatedAt) || new Date().toISOString(),
      goals: Array.isArray(raw && raw.goals) ? raw.goals : [],
      habits: Array.isArray(raw && raw.habits) ? raw.habits : [],
      tasks: Array.isArray(raw && raw.tasks) ? raw.tasks : [],
    };
    clean.goals = clean.goals.map((g) => ({
      id: g.id || uid("goal"),
      title: String(g.title || "Untitled Goal"),
      description: String(g.description || ""),
      category: g.category || "Personal",
      color: g.color || "#4f46e5",
      targetDate: g.targetDate || "",
      status: ["active", "paused", "completed"].includes(g.status) ? g.status : "active",
      progressMode: g.progressMode === "manual" ? "manual" : "auto",
      manualProgress: Number.isFinite(Number(g.manualProgress)) ? Math.min(100, Math.max(0, Number(g.manualProgress))) : 0,
      milestones: Array.isArray(g.milestones)
        ? g.milestones.map((m) => ({
            id: m.id || uid("ms"),
            title: String(m.title || ""),
            completed: Boolean(m.completed),
          }))
        : [],
      createdAt: g.createdAt || new Date().toISOString(),
    }));
    clean.habits = clean.habits.map((h) => ({
      id: h.id || uid("hab"),
      title: String(h.title || "Untitled Habit"),
      description: String(h.description || ""),
      goalId: h.goalId || "",
      frequencyType: ["daily", "weekdays", "custom_days", "times_per_week"].includes(h.frequencyType)
        ? h.frequencyType
        : "daily",
      customDays: Array.isArray(h.customDays) ? h.customDays.map(Number) : [1, 3, 5],
      timesPerWeek: Math.min(7, Math.max(1, Number(h.timesPerWeek) || 3)),
      color: h.color || "#10b981",
      completions: Array.from(new Set(Array.isArray(h.completions) ? h.completions : [])).sort(),
      archived: Boolean(h.archived),
      createdAt: h.createdAt || new Date().toISOString(),
    }));
    clean.tasks = clean.tasks.map((t) => ({
      id: t.id || uid("tsk"),
      title: String(t.title || "Untitled Task"),
      notes: String(t.notes || ""),
      goalId: t.goalId || "",
      priority: ["high", "medium", "low"].includes(t.priority) ? t.priority : "medium",
      status: ["todo", "in_progress", "done"].includes(t.status) ? t.status : "todo",
      dueDate: t.dueDate || "",
      isFocus: Boolean(t.isFocus),
      recurrence: ["none", "daily", "weekdays", "weekly", "monthly"].includes(t.recurrence) ? t.recurrence : "none",
      tags: Array.isArray(t.tags) ? t.tags.map(String).filter(Boolean) : [],
      completedAt: t.completedAt || null,
      createdAt: t.createdAt || new Date().toISOString(),
    }));
    return clean;
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const sample = createSampleData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
        return sample;
      }
      return normalizeState(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to read storage, falling back to sample:", err);
      return createSampleData();
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateStorageIndicator();
    } catch (err) {
      showToast("Warning: Browser storage quota reached!");
    }
  }

  function updateStorageIndicator() {
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    const kb = (new Blob([raw]).size / 1024).toFixed(1);
    const label = document.getElementById("storage-size-label");
    if (label) {
      label.textContent = `Browser Saved (${kb} KB)`;
    }
  }

  // --- Domain Calculations (Linking Goals, Habits & Tasks) ---
  function getGoalById(goalId) {
    if (!goalId) return null;
    return state.goals.find((g) => g.id === goalId) || null;
  }

  function computeGoalStats(goal) {
    const linkedTasks = state.tasks.filter((t) => t.goalId === goal.id);
    const doneTasks = linkedTasks.filter((t) => t.status === "done").length;
    const linkedHabits = state.habits.filter((h) => h.goalId === goal.id && !h.archived);
    const totalMs = goal.milestones.length;
    const doneMs = goal.milestones.filter((m) => m.completed).length;

    let pct = 0;
    if (goal.status === "completed") {
      pct = 100;
    } else if (goal.progressMode === "manual") {
      pct = goal.manualProgress;
    } else {
      const totalUnits = totalMs + linkedTasks.length;
      if (totalUnits > 0) {
        pct = Math.round(((doneMs + doneTasks) / totalUnits) * 100);
      } else {
        pct = goal.manualProgress || 0;
      }
    }

    return {
      pct,
      totalMs,
      doneMs,
      totalTasks: linkedTasks.length,
      doneTasks,
      linkedHabitsCount: linkedHabits.length,
      linkedHabits,
      linkedTasks,
    };
  }

  // --- Habit Scheduling & Streak Engine ---
  function isDayScheduledForHabit(habit, dateStr) {
    const dow = parseLocalDate(dateStr).getDay();
    if (habit.frequencyType === "daily") return true;
    if (habit.frequencyType === "weekdays") return dow >= 1 && dow <= 5;
    if (habit.frequencyType === "custom_days") return habit.customDays.includes(dow);
    return true; // times_per_week is flexible any day
  }

  function completionsInWeek(habit, mondayStr) {
    const sunStr = addDaysStr(mondayStr, 6);
    return habit.completions.filter((d) => d >= mondayStr && d <= sunStr).length;
  }

  function isHabitDueToday(habit) {
    if (habit.archived) return false;
    const t = todayStr();
    if (habit.completions.includes(t)) return true; // Keep visible on Today's list when completed today
    if (habit.frequencyType === "times_per_week") {
      const mon = startOfWeekMonday(t);
      return completionsInWeek(habit, mon) < habit.timesPerWeek;
    }
    return isDayScheduledForHabit(habit, t);
  }

  function frequencyLabel(habit) {
    if (habit.frequencyType === "daily") return "Every day";
    if (habit.frequencyType === "weekdays") return "Weekdays";
    if (habit.frequencyType === "times_per_week") return `${habit.timesPerWeek}x / week`;
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return habit.customDays
      .slice()
      .sort()
      .map((d) => names[d])
      .join(", ");
  }

  function computeHabitMetrics(habit) {
    const set = new Set(habit.completions);
    const t = todayStr();

    // 30-day consistency
    let scheduled30 = 0;
    let done30 = 0;
    if (habit.frequencyType === "times_per_week") {
      scheduled30 = Math.round((habit.timesPerWeek / 7) * 30);
      for (let i = 0; i < 30; i++) {
        if (set.has(addDaysStr(t, -i))) done30++;
      }
    } else {
      for (let i = 0; i < 30; i++) {
        const d = addDaysStr(t, -i);
        if (isDayScheduledForHabit(habit, d)) {
          scheduled30++;
          if (set.has(d)) done30++;
        }
      }
    }
    const rate30d = scheduled30 > 0 ? Math.min(100, Math.round((done30 / scheduled30) * 100)) : 0;

    // Streak calculation
    if (habit.frequencyType === "times_per_week") {
      const thisMon = startOfWeekMonday(t);
      const thisWeekCount = completionsInWeek(habit, thisMon);
      let currentWeeks = thisWeekCount >= habit.timesPerWeek ? 1 : 0;
      let cursorMon = addDaysStr(thisMon, -7);
      for (let w = 0; w < 104; w++) {
        if (completionsInWeek(habit, cursorMon) >= habit.timesPerWeek) {
          currentWeeks++;
          cursorMon = addDaysStr(cursorMon, -7);
        } else {
          break;
        }
      }
      // Best weekly streak over history
      let bestWeeks = currentWeeks;
      if (habit.completions.length > 0) {
        const earliestMon = startOfWeekMonday(habit.completions[0]);
        let run = 0;
        let scan = earliestMon;
        while (scan <= thisMon) {
          if (completionsInWeek(habit, scan) >= habit.timesPerWeek) {
            run++;
            if (run > bestWeeks) bestWeeks = run;
          } else {
            run = 0;
          }
          scan = addDaysStr(scan, 7);
        }
      }
      return {
        current: currentWeeks,
        best: bestWeeks,
        unit: "w",
        rate30d,
        weekProgress: `${thisWeekCount}/${habit.timesPerWeek} this wk`,
      };
    }

    // Daily / Weekdays / Custom Days streak
    let current = 0;
    for (let i = 0; i < 730; i++) {
      const d = addDaysStr(t, -i);
      if (!isDayScheduledForHabit(habit, d)) continue;
      if (set.has(d)) {
        current++;
      } else {
        if (i === 0) continue; // Today still in progress
        break;
      }
    }

    let best = current;
    if (habit.completions.length > 0) {
      let run = 0;
      let scan = habit.completions[0];
      while (scan <= t) {
        if (isDayScheduledForHabit(habit, scan)) {
          if (set.has(scan)) {
            run++;
            if (run > best) best = run;
          } else if (scan !== t) {
            run = 0;
          }
        }
        scan = addDaysStr(scan, 1);
      }
    }

    return {
      current,
      best,
      unit: "d",
      rate30d,
      weekProgress: null,
    };
  }

  // --- Mutations ---
  function toggleHabitDate(habitId, dateStr) {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return;
    state.isSample = false;
    const idx = habit.completions.indexOf(dateStr);
    if (idx >= 0) {
      habit.completions.splice(idx, 1);
    } else {
      habit.completions.push(dateStr);
      habit.completions.sort();
    }
    saveState();
    renderAll();
  }

  function nextRecurrenceDate(baseDateStr, recurrence) {
    const base = baseDateStr && baseDateStr >= todayStr() ? baseDateStr : todayStr();
    if (recurrence === "daily") return addDaysStr(base, 1);
    if (recurrence === "weekly") return addDaysStr(base, 7);
    if (recurrence === "monthly") return addMonthsStr(base, 1);
    if (recurrence === "weekdays") {
      let next = addDaysStr(base, 1);
      while ([0, 6].includes(parseLocalDate(next).getDay())) {
        next = addDaysStr(next, 1);
      }
      return next;
    }
    return "";
  }

  function toggleTaskDone(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    state.isSample = false;

    if (task.status !== "done") {
      task.status = "done";
      task.completedAt = new Date().toISOString();

      if (task.recurrence && task.recurrence !== "none") {
        const nextDue = nextRecurrenceDate(task.dueDate, task.recurrence);
        state.tasks.unshift({
          id: uid("tsk"),
          title: task.title,
          notes: task.notes,
          goalId: task.goalId,
          priority: task.priority,
          status: "todo",
          dueDate: nextDue,
          isFocus: nextDue === todayStr(),
          recurrence: task.recurrence,
          tags: [...task.tags],
          completedAt: null,
          createdAt: new Date().toISOString(),
        });
        showToast(`Completed! Next recurring task scheduled for ${humanDateLabel(nextDue)}.`);
      }
    } else {
      task.status = "todo";
      task.completedAt = null;
    }

    saveState();
    renderAll();
  }

  function toggleTaskFocus(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    state.isSample = false;
    task.isFocus = !task.isFocus;
    saveState();
    renderAll();
  }

  function updateTaskStatus(taskId, newStatus) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    if (newStatus === "done") {
      toggleTaskDone(taskId);
      return;
    }
    state.isSample = false;
    task.status = newStatus;
    task.completedAt = null;
    saveState();
    renderAll();
  }

  function toggleGoalMilestone(goalId, milestoneId) {
    const goal = getGoalById(goalId);
    if (!goal) return;
    const ms = goal.milestones.find((m) => m.id === milestoneId);
    if (!ms) return;
    state.isSample = false;
    ms.completed = !ms.completed;
    saveState();
    renderAll();
  }

  // --- Shared UI Snippets ---
  function renderGoalPill(goalId) {
    const goal = getGoalById(goalId);
    if (!goal) return "";
    return `<button type="button" class="goal-pill" data-open-goal="${esc(goal.id)}" title="Inspect Goal: ${esc(goal.title)}">
      <span class="goal-dot" style="background:${esc(goal.color)}"></span>
      <span>${esc(goal.title)}</span>
    </button>`;
  }

  function renderDueLabel(dueDate, isDone) {
    if (!dueDate) return "";
    const t = todayStr();
    const diff = daysBetween(t, dueDate);
    let cls = "";
    if (!isDone) {
      if (diff < 0) cls = "due-overdue";
      else if (diff === 0) cls = "due-today";
    }
    const prefix = !isDone && diff < 0 ? "Overdue · " : "";
    return `<span class="${cls}">${prefix}${esc(humanDateLabel(dueDate))}</span>`;
  }

  function renderTaskRow(task) {
    const isDone = task.status === "done";
    const starFill = task.isFocus ? "currentColor" : "none";
    const recBadge =
      task.recurrence && task.recurrence !== "none"
        ? `<span class="badge" title="Repeats ${esc(task.recurrence)}">&#8635; ${esc(task.recurrence)}</span>`
        : "";
    const statusBadge =
      task.status === "in_progress" ? `<span class="badge" style="color:var(--primary)">In Progress</span>` : "";

    return `
      <div class="item-row ${isDone ? "completed" : ""}">
        <button type="button" class="check-btn ${isDone ? "checked" : ""}" data-toggle-task="${esc(task.id)}" aria-label="Complete task">
          ${isDone ? "&#10003;" : ""}
        </button>
        <div class="item-body">
          <div class="item-title-line">
            <span class="item-title" data-edit-task="${esc(task.id)}">${esc(task.title)}</span>
            <span class="badge prio-${esc(task.priority)}">${esc(task.priority)}</span>
            ${statusBadge}
            ${recBadge}
          </div>
          <div class="item-meta">
            ${renderGoalPill(task.goalId)}
            ${renderDueLabel(task.dueDate, isDone)}
            ${task.tags.map((tg) => `<span>#${esc(tg)}</span>`).join(" ")}
          </div>
        </div>
        <div class="item-actions">
          <button type="button" class="star-btn ${task.isFocus ? "active" : ""}" data-star-task="${esc(task.id)}" title="Pin to Today's Focus">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${starFill}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
          <button type="button" class="btn btn-icon btn-ghost" data-edit-task="${esc(task.id)}" title="Edit Task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  // --- Render Sidebar & Select Options ---
  function renderNavigationAndSelects() {
    const t = todayStr();
    const dueHabitsLeft = state.habits.filter((h) => isHabitDueToday(h) && !h.completions.includes(t)).length;
    const focusTasksLeft = state.tasks.filter(
      (tk) => tk.status !== "done" && (tk.isFocus || (tk.dueDate && tk.dueDate <= t))
    ).length;

    document.getElementById("badge-today").textContent = dueHabitsLeft + focusTasksLeft;
    document.getElementById("badge-goals").textContent = state.goals.filter((g) => g.status === "active").length;
    document.getElementById("badge-habits").textContent = state.habits.filter((h) => !h.archived).length;
    document.getElementById("badge-tasks").textContent = state.tasks.filter((tk) => tk.status !== "done").length;

    // Sidebar active goals quick list
    const sideGoals = document.getElementById("sidebar-goals-list");
    const activeGoals = state.goals.filter((g) => g.status === "active");
    if (activeGoals.length === 0) {
      sideGoals.innerHTML = `<div class="text-muted text-xs" style="padding:4px 10px">No active goals yet</div>`;
    } else {
      sideGoals.innerHTML = activeGoals
        .map((g) => {
          const st = computeGoalStats(g);
          return `<button type="button" class="sidebar-goal-item" data-open-goal="${esc(g.id)}">
            <span class="goal-dot" style="background:${esc(g.color)}"></span>
            <span class="sidebar-goal-name">${esc(g.title)}</span>
            <span class="sidebar-goal-pct">${st.pct}%</span>
          </button>`;
        })
        .join("");
    }

    // Populate Goal dropdowns across forms & filters
    const goalOptionsHtml =
      `<option value="">No Linked Goal</option>` +
      state.goals.map((g) => `<option value="${esc(g.id)}">${esc(g.title)} (${esc(g.category)})</option>`).join("");

    ["quick-task-goal", "habit-goal", "task-goal"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const prev = el.value;
      el.innerHTML = goalOptionsHtml;
      if ([...el.options].some((o) => o.value === prev)) el.value = prev;
    });

    const filterGoalOptions =
      `<option value="all">All Goals</option><option value="unlinked">Unlinked Items</option>` +
      state.goals.map((g) => `<option value="${esc(g.id)}">${esc(g.title)}</option>`).join("");

    ["habit-goal-filter", "task-goal-filter"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const prev = el.value || "all";
      el.innerHTML = filterGoalOptions;
      if ([...el.options].some((o) => o.value === prev)) el.value = prev;
    });

    updateStorageIndicator();
  }

  // --- VIEW 1: TODAY'S FOCUS ---
  function renderTodayView() {
    const t = todayStr();
    const banner = document.getElementById("demo-banner");
    banner.classList.toggle("hidden", !state.isSample);

    const todayHabits = state.habits.filter((h) => isHabitDueToday(h));
    const doneTodayHabits = todayHabits.filter((h) => h.completions.includes(t)).length;

    const focusTasks = state.tasks
      .filter((tk) => tk.status !== "done" && (tk.isFocus || (tk.dueDate && tk.dueDate <= t)))
      .sort((a, b) => {
        const prioRank = { high: 0, medium: 1, low: 2 };
        const aOver = a.dueDate && a.dueDate < t ? 0 : 1;
        const bOver = b.dueDate && b.dueDate < t ? 0 : 1;
        if (aOver !== bOver) return aOver - bOver;
        return prioRank[a.priority] - prioRank[b.priority];
      });

    const completedTodayTasks = state.tasks.filter(
      (tk) => tk.status === "done" && tk.completedAt && tk.completedAt.slice(0, 10) === t
    );

    const activeGoals = state.goals.filter((g) => g.status === "active");
    const avgGoalPct =
      activeGoals.length > 0
        ? Math.round(activeGoals.reduce((acc, g) => acc + computeGoalStats(g).pct, 0) / activeGoals.length)
        : 0;

    let topStreakLabel = "0d";
    let topStreakHabit = "Start your first streak";
    state.habits
      .filter((h) => !h.archived)
      .forEach((h) => {
        const m = computeHabitMetrics(h);
        const score = m.unit === "w" ? m.current * 7 : m.current;
        const curBestScore = parseInt(topStreakLabel, 10) || 0;
        if (score > curBestScore) {
          topStreakLabel = `${m.current}${m.unit}`;
          topStreakHabit = h.title;
        }
      });

    document.getElementById("today-stats-grid").innerHTML = `
      <div class="stat-card">
        <div class="stat-label"><span>Today's Habits</span><span>${todayHabits.length ? Math.round((doneTodayHabits / todayHabits.length) * 100) : 0}%</span></div>
        <div class="stat-value">${doneTodayHabits} / ${todayHabits.length}</div>
        <div class="progress-track"><div class="progress-fill" style="width:${todayHabits.length ? Math.round((doneTodayHabits / todayHabits.length) * 100) : 0}%;background:var(--success)"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>Focus Queue</span><span>+${completedTodayTasks.length} done today</span></div>
        <div class="stat-value">${focusTasks.length}</div>
        <div class="stat-sub">${focusTasks.length === 0 ? "All focus tasks cleared!" : "Tasks due or starred for today"}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>Goal Momentum</span><span>${activeGoals.length} active</span></div>
        <div class="stat-value">${avgGoalPct}%</div>
        <div class="progress-track"><div class="progress-fill" style="width:${avgGoalPct}%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>Top Active Streak</span><span>&#128293;</span></div>
        <div class="stat-value">${esc(topStreakLabel)}</div>
        <div class="stat-sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(topStreakHabit)}</div>
      </div>
    `;

    // Today's Habits List
    document.getElementById("today-habits-summary").textContent = `${doneTodayHabits} of ${todayHabits.length} completed today`;
    const habitsEl = document.getElementById("today-habits-list");
    if (todayHabits.length === 0) {
      habitsEl.innerHTML = `<div class="empty-state">No habits scheduled for today. <button class="btn btn-ghost btn-sm" id="empty-add-habit">+ Add Habit</button></div>`;
    } else {
      habitsEl.innerHTML = todayHabits
        .map((h) => {
          const done = h.completions.includes(t);
          const m = computeHabitMetrics(h);
          return `
            <div class="item-row ${done ? "completed" : ""}">
              <button type="button" class="check-btn round ${done ? "checked" : ""}" style="${done ? `background:${esc(h.color)};border-color:${esc(h.color)}` : ""}" data-toggle-habit-today="${esc(h.id)}" aria-label="Toggle habit today">
                ${done ? "&#10003;" : ""}
              </button>
              <div class="item-body">
                <div class="item-title-line">
                  <span class="item-title" data-edit-habit="${esc(h.id)}">${esc(h.title)}</span>
                  <span class="streak-badge">&#128293; ${m.current}${m.unit}</span>
                  ${m.weekProgress ? `<span class="badge">${esc(m.weekProgress)}</span>` : ""}
                </div>
                <div class="item-meta">
                  ${renderGoalPill(h.goalId)}
                  ${h.description ? `<span>${esc(h.description)}</span>` : ""}
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    // Today's Focus & Due Tasks
    document.getElementById("today-tasks-summary").textContent = `${focusTasks.length} remaining`;
    const tasksEl = document.getElementById("today-tasks-list");
    if (focusTasks.length === 0) {
      tasksEl.innerHTML = `<div class="empty-state">Your focus list is clear! Pin any task with the star icon or add one above.</div>`;
    } else {
      tasksEl.innerHTML = focusTasks.map(renderTaskRow).join("");
    }

    // Goal Momentum Panel
    const goalsEl = document.getElementById("today-goals-list");
    if (activeGoals.length === 0) {
      goalsEl.innerHTML = `<div class="empty-state">No active goals yet. Create a goal to connect your daily habits and tasks.</div>`;
    } else {
      goalsEl.innerHTML = activeGoals
        .map((g) => {
          const st = computeGoalStats(g);
          const daysLeft = g.targetDate ? daysBetween(t, g.targetDate) : null;
          const dueTxt =
            daysLeft === null
              ? ""
              : daysLeft < 0
              ? `${Math.abs(daysLeft)}d past target`
              : daysLeft === 0
              ? "Target is today"
              : `${daysLeft}d left`;

          return `
            <div class="item-row" style="cursor:pointer" data-open-goal="${esc(g.id)}">
              <div class="item-body">
                <div class="item-title-line" style="justify-content:space-between">
                  <span class="item-title">
                    <span class="goal-dot" style="display:inline-block;background:${esc(g.color)};margin-right:6px"></span>
                    ${esc(g.title)}
                  </span>
                  <span class="badge">${st.pct}%</span>
                </div>
                <div class="progress-track" style="margin:7px 0 5px">
                  <div class="progress-fill" style="width:${st.pct}%;background:${esc(g.color)}"></div>
                </div>
                <div class="item-meta" style="justify-content:space-between">
                  <span>${st.doneMs}/${st.totalMs} milestones &bull; ${st.doneTasks}/${st.totalTasks} tasks &bull; ${st.linkedHabitsCount} habits</span>
                  <span>${esc(dueTxt)}</span>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    // Upcoming Deadlines (Next 7 days)
    const maxUpcoming = addDaysStr(t, 7);
    const upcoming = state.tasks
      .filter((tk) => tk.status !== "done" && tk.dueDate && tk.dueDate > t && tk.dueDate <= maxUpcoming)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const upEl = document.getElementById("today-upcoming-list");
    if (upcoming.length === 0) {
      upEl.innerHTML = `<div class="empty-state" style="padding:18px">No deadlines in the next 7 days.</div>`;
    } else {
      upEl.innerHTML = upcoming
        .slice(0, 6)
        .map(
          (tk) => `
          <div class="item-row">
            <button type="button" class="check-btn" data-toggle-task="${esc(tk.id)}"></button>
            <div class="item-body">
              <div class="item-title-line">
                <span class="item-title" data-edit-task="${esc(tk.id)}">${esc(tk.title)}</span>
              </div>
              <div class="item-meta">
                ${renderGoalPill(tk.goalId)}
                <span>Due ${esc(humanDateLabel(tk.dueDate))}</span>
              </div>
            </div>
          </div>`
        )
        .join("");
    }
  }

  // --- VIEW 2: GOALS ---
  function renderGoalsView() {
    const grid = document.getElementById("goals-grid");
    const filtered = state.goals.filter((g) => {
      if (ui.goalStatusFilter !== "all" && g.status !== ui.goalStatusFilter) return false;
      if (ui.goalCategoryFilter !== "all" && g.category !== ui.goalCategoryFilter) return false;
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">No goals match your current filter. Click <strong>+ Goal</strong> in the top bar to set a new direction.</div>`;
      return;
    }

    const t = todayStr();
    grid.innerHTML = filtered
      .map((g) => {
        const st = computeGoalStats(g);
        const daysLeft = g.targetDate ? daysBetween(t, g.targetDate) : null;
        const targetText = g.targetDate
          ? `${humanDateLabel(g.targetDate)}${daysLeft !== null && g.status !== "completed" ? ` (${daysLeft >= 0 ? daysLeft + "d left" : Math.abs(daysLeft) + "d ago"})` : ""}`
          : "Open-ended";

        const previewMs = g.milestones.slice(0, 4);
        const moreMs = g.milestones.length > 4 ? g.milestones.length - 4 : 0;

        return `
          <article class="goal-card" style="--goal-accent:${esc(g.color)}">
            <div class="goal-card-top">
              <div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                  <span class="badge">${esc(g.category)}</span>
                  <span class="badge">${esc(g.status)}</span>
                </div>
                <h3 class="goal-card-title" data-open-goal="${esc(g.id)}">${esc(g.title)}</h3>
              </div>
              <button type="button" class="btn btn-icon btn-ghost" data-edit-goal="${esc(g.id)}" title="Edit Goal">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
            </div>

            ${g.description ? `<p class="goal-card-desc">${esc(g.description)}</p>` : ""}

            <div>
              <div class="goal-progress-header">
                <span>Progress (${g.progressMode === "auto" ? "Auto-linked" : "Manual"})</span>
                <span>${st.pct}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${st.pct}%;background:${esc(g.color)}"></div>
              </div>
            </div>

            ${
              previewMs.length > 0
                ? `<div class="goal-milestones-preview">
                    ${previewMs
                      .map(
                        (m) => `
                      <label class="milestone-check-row ${m.completed ? "done" : ""}">
                        <input type="checkbox" ${m.completed ? "checked" : ""} data-ms-goal="${esc(g.id)}" data-ms-id="${esc(m.id)}" />
                        <span>${esc(m.title)}</span>
                      </label>`
                      )
                      .join("")}
                    ${moreMs > 0 ? `<span class="text-xs text-muted">+${moreMs} more milestones</span>` : ""}
                  </div>`
                : ""
            }

            <div class="goal-card-footer">
              <div class="goal-linked-counts">
                <span>&#9889; ${st.linkedHabitsCount} habits</span>
                <span>&#10003; ${st.doneTasks}/${st.totalTasks} tasks</span>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" data-open-goal="${esc(g.id)}">${esc(targetText)} &rarr;</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  // --- VIEW 3: HABITS ---
  function renderHabitsHeatmap() {
    const container = document.getElementById("habits-heatmap");
    const activeHabits = state.habits.filter((h) => !h.archived);
    const t = todayStr();

    // Build 12 weeks (84 days) ending at end of current week (Sunday)
    const thisMonday = startOfWeekMonday(t);
    const startMonday = addDaysStr(thisMonday, -11 * 7);

    let totalCheckins = 0;
    const weeksHtml = [];

    for (let w = 0; w < 12; w++) {
      const cells = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = addDaysStr(startMonday, w * 7 + d);
        if (dateStr > t) {
          cells.push(`<div class="heat-cell lvl-0" style="opacity:0.35" title="${dateStr} (upcoming)"></div>`);
          continue;
        }
        let count = 0;
        activeHabits.forEach((h) => {
          if (h.completions.includes(dateStr)) count++;
        });
        totalCheckins += count;
        let lvl = 0;
        if (count > 0) {
          const denom = Math.max(1, activeHabits.length);
          const ratio = count / denom;
          if (ratio <= 0.25) lvl = 1;
          else if (ratio <= 0.5) lvl = 2;
          else if (ratio <= 0.8) lvl = 3;
          else lvl = 4;
        }
        cells.push(`<div class="heat-cell lvl-${lvl}" title="${dateStr}: ${count} habit check-in${count === 1 ? "" : "s"}"></div>`);
      }
      weeksHtml.push(`<div class="heatmap-week">${cells.join("")}</div>`);
    }

    container.innerHTML = weeksHtml.join("");
    document.getElementById("heatmap-subtitle").textContent = `${totalCheckins} check-ins logged in the last 12 weeks`;
  }

  function renderHabitsView() {
    renderHabitsHeatmap();
    const listEl = document.getElementById("habits-list");
    const t = todayStr();

    const filtered = state.habits.filter((h) => {
      if (ui.habitFilter === "active" && h.archived) return false;
      if (ui.habitFilter === "archived" && !h.archived) return false;
      if (ui.habitFilter === "today" && !isHabitDueToday(h)) return false;

      if (ui.habitGoalFilter === "unlinked" && h.goalId) return false;
      if (ui.habitGoalFilter !== "all" && ui.habitGoalFilter !== "unlinked" && h.goalId !== ui.habitGoalFilter) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty-state">No habits match this filter. Build consistency by clicking <strong>+ Habit</strong> above.</div>`;
      return;
    }

    const dowShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    listEl.innerHTML = filtered
      .map((h) => {
        const m = computeHabitMetrics(h);
        const stripCells = [];
        for (let i = 13; i >= 0; i--) {
          const dStr = addDaysStr(t, -i);
          const dt = parseLocalDate(dStr);
          const done = h.completions.includes(dStr);
          const isToday = i === 0;
          stripCells.push(`
            <button type="button"
              class="day-cell-btn ${done ? "done" : ""} ${isToday ? "is-today" : ""}"
              style="--habit-color:${esc(h.color)}"
              data-habit-toggle-day="${esc(h.id)}"
              data-date="${dStr}"
              title="Toggle ${dStr}">
              <span class="dow">${dowShort[dt.getDay()]}</span>
              <span class="dom">${dt.getDate()}</span>
            </button>
          `);
        }

        return `
          <div class="habit-card">
            <div class="habit-card-info">
              <div class="item-title-line">
                <span class="goal-dot" style="background:${esc(h.color)}"></span>
                <span class="item-title" data-edit-habit="${esc(h.id)}">${esc(h.title)}</span>
                <span class="badge">${esc(frequencyLabel(h))}</span>
                <span class="streak-badge">&#128293; ${m.current}${m.unit} streak</span>
              </div>
              <div class="item-meta" style="margin-top:6px">
                ${renderGoalPill(h.goalId)}
                <span>Best: <strong>${m.best}${m.unit}</strong></span>
                <span>&bull; 30d rate: <strong>${m.rate30d}%</strong></span>
                ${m.weekProgress ? `<span>&bull; ${esc(m.weekProgress)}</span>` : ""}
                ${h.description ? `<span>&bull; ${esc(h.description)}</span>` : ""}
              </div>
            </div>

            <div class="habit-14d-strip" aria-label="Last 14 days completion toggle">
              ${stripCells.join("")}
            </div>

            <button type="button" class="btn btn-icon btn-ghost" data-edit-habit="${esc(h.id)}" title="Edit Habit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
          </div>
        `;
      })
      .join("");
  }

  // --- VIEW 4: TASKS (LIST & KANBAN BOARD) ---
  function getFilteredTasks() {
    const t = todayStr();
    return state.tasks
      .filter((tk) => {
        if (ui.taskGoalFilter === "unlinked" && tk.goalId) return false;
        if (ui.taskGoalFilter !== "all" && ui.taskGoalFilter !== "unlinked" && tk.goalId !== ui.taskGoalFilter) {
          return false;
        }
        if (ui.taskPriorityFilter !== "all" && tk.priority !== ui.taskPriorityFilter) return false;

        if (ui.taskLayout === "kanban") {
          // In Kanban layout, respect tab filter when narrowing (e.g., focus/overdue), otherwise show all stages
          if (ui.taskTab === "focus") return tk.isFocus || tk.dueDate === t;
          if (ui.taskTab === "upcoming") return tk.dueDate && tk.dueDate > t;
          if (ui.taskTab === "overdue") return tk.status !== "done" && tk.dueDate && tk.dueDate < t;
          return true;
        }

        if (ui.taskTab === "active") return tk.status !== "done";
        if (ui.taskTab === "focus") return tk.status !== "done" && (tk.isFocus || (tk.dueDate && tk.dueDate <= t));
        if (ui.taskTab === "upcoming") return tk.status !== "done" && tk.dueDate && tk.dueDate > t;
        if (ui.taskTab === "overdue") return tk.status !== "done" && tk.dueDate && tk.dueDate < t;
        if (ui.taskTab === "done") return tk.status === "done";
        return true;
      })
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        const prioRank = { high: 0, medium: 1, low: 2 };
        if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return prioRank[a.priority] - prioRank[b.priority];
      });
  }

  function renderTasksView() {
    const container = document.getElementById("tasks-container");
    const tasks = getFilteredTasks();

    if (ui.taskLayout === "list") {
      if (tasks.length === 0) {
        container.innerHTML = `<div class="empty-state">No tasks match these filters. Click <strong>+ Task</strong> to add one.</div>`;
        return;
      }
      container.innerHTML = `<div class="stack-list">${tasks.map(renderTaskRow).join("")}</div>`;
      return;
    }

    // Kanban Board View
    const cols = [
      { key: "todo", label: "To Do", items: tasks.filter((t) => t.status === "todo") },
      { key: "in_progress", label: "In Progress", items: tasks.filter((t) => t.status === "in_progress") },
      { key: "done", label: "Completed", items: tasks.filter((t) => t.status === "done") },
    ];

    container.innerHTML = `
      <div class="kanban-grid">
        ${cols
          .map(
            (col) => `
          <div class="kanban-col" data-kanban-col="${col.key}">
            <div class="kanban-col-header">
              <span>${col.label}</span>
              <span class="badge">${col.items.length}</span>
            </div>
            <div class="kanban-cards">
              ${
                col.items.length === 0
                  ? `<div class="empty-state" style="padding:18px;font-size:12px">Drop tasks here</div>`
                  : col.items
                      .map(
                        (tk) => `
                    <div class="kanban-card" draggable="true" data-drag-task="${esc(tk.id)}">
                      <div class="item-title-line" style="justify-content:space-between">
                        <span class="badge prio-${esc(tk.priority)}">${esc(tk.priority)}</span>
                        <button type="button" class="star-btn ${tk.isFocus ? "active" : ""}" data-star-task="${esc(tk.id)}" title="Today's Focus">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="${tk.isFocus ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                      </div>
                      <div class="item-title" data-edit-task="${esc(tk.id)}" style="${tk.status === "done" ? "text-decoration:line-through;color:var(--text-muted)" : ""}">${esc(tk.title)}</div>
                      <div class="kanban-card-footer">
                        ${renderGoalPill(tk.goalId)}
                        <span class="text-xs text-muted">${renderDueLabel(tk.dueDate, tk.status === "done")}</span>
                      </div>
                    </div>`
                      )
                      .join("")
              }
            </div>
          </div>`
          )
          .join("")}
      </div>
    `;

    bindKanbanDragAndDrop();
  }

  function bindKanbanDragAndDrop() {
    let draggedId = null;
    document.querySelectorAll("[data-drag-task]").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        draggedId = card.getAttribute("data-drag-task");
        e.dataTransfer.effectAllowed = "move";
      });
    });
    document.querySelectorAll("[data-kanban-col]").forEach((col) => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        col.classList.add("drag-over");
      });
      col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("drag-over");
        const targetStatus = col.getAttribute("data-kanban-col");
        if (draggedId && targetStatus) {
          updateTaskStatus(draggedId, targetStatus);
        }
      });
    });
  }

  // --- GOAL DETAIL MODAL (DEEP LINKED VIEW) ---
  function openGoalDetailModal(goalId) {
    const goal = getGoalById(goalId);
    if (!goal) return;
    ui.activeDetailGoalId = goal.id;

    const st = computeGoalStats(goal);
    const t = todayStr();
    document.getElementById("detail-goal-badge").textContent = `${goal.category} · ${goal.status}`;
    document.getElementById("detail-goal-title").textContent = goal.title;

    const body = document.getElementById("detail-goal-body");
    body.innerHTML = `
      ${goal.description ? `<p class="text-secondary" style="margin:0">${esc(goal.description)}</p>` : ""}

      <div class="storage-summary-box">
        <div><strong>Overall Progress:</strong> ${st.pct}% (${goal.progressMode === "auto" ? "Auto-calculated" : "Manual"})</div>
        <div><strong>Target:</strong> ${goal.targetDate ? esc(humanDateLabel(goal.targetDate)) + ` (${esc(goal.targetDate)})` : "No target date"}</div>
      </div>

      <div class="progress-track" style="height:10px">
        <div class="progress-fill" style="width:${st.pct}%;background:${esc(goal.color)}"></div>
      </div>

      <div>
        <div class="panel-header" style="margin-bottom:8px">
          <h4 style="margin:0">Milestones (${st.doneMs}/${st.totalMs})</h4>
        </div>
        <div class="stack-list">
          ${
            goal.milestones.length === 0
              ? `<div class="text-muted text-sm">No milestones added yet.</div>`
              : goal.milestones
                  .map(
                    (m) => `
                  <label class="item-row milestone-check-row ${m.completed ? "done" : ""}" style="margin:0">
                    <input type="checkbox" ${m.completed ? "checked" : ""} data-ms-goal="${esc(goal.id)}" data-ms-id="${esc(m.id)}" />
                    <span style="flex:1">${esc(m.title)}</span>
                  </label>`
                  )
                  .join("")
          }
        </div>
      </div>

      <hr class="divider" />

      <div>
        <div class="panel-header" style="margin-bottom:8px">
          <h4 style="margin:0">Linked Habits (${st.linkedHabits.length})</h4>
          <button type="button" class="btn btn-secondary btn-sm" data-new-habit-for-goal="${esc(goal.id)}">+ Add Linked Habit</button>
        </div>
        <div class="stack-list">
          ${
            st.linkedHabits.length === 0
              ? `<div class="text-muted text-sm">No habits linked to this goal yet.</div>`
              : st.linkedHabits
                  .map((h) => {
                    const done = h.completions.includes(t);
                    const hm = computeHabitMetrics(h);
                    return `
                      <div class="item-row ${done ? "completed" : ""}">
                        <button type="button" class="check-btn round ${done ? "checked" : ""}" style="${done ? `background:${esc(h.color)};border-color:${esc(h.color)}` : ""}" data-toggle-habit-today="${esc(h.id)}">
                          ${done ? "&#10003;" : ""}
                        </button>
                        <div class="item-body">
                          <div class="item-title-line">
                            <span class="item-title" data-edit-habit="${esc(h.id)}">${esc(h.title)}</span>
                            <span class="badge">${esc(frequencyLabel(h))}</span>
                            <span class="streak-badge">&#128293; ${hm.current}${hm.unit}</span>
                          </div>
                        </div>
                      </div>`;
                  })
                  .join("")
          }
        </div>
      </div>

      <hr class="divider" />

      <div>
        <div class="panel-header" style="margin-bottom:8px">
          <h4 style="margin:0">Linked Tasks (${st.doneTasks}/${st.totalTasks} completed)</h4>
          <button type="button" class="btn btn-primary btn-sm" data-new-task-for-goal="${esc(goal.id)}">+ Add Linked Task</button>
        </div>
        <div class="stack-list">
          ${
            st.linkedTasks.length === 0
              ? `<div class="text-muted text-sm">No tasks linked to this goal yet.</div>`
              : st.linkedTasks.map(renderTaskRow).join("")
          }
        </div>
      </div>
    `;

    openModal("modal-goal-detail");
  }

  // --- GLOBAL SEARCH ---
  function renderSearchResults(query) {
    const panel = document.getElementById("search-results-panel");
    const q = query.trim().toLowerCase();
    if (!q) {
      panel.classList.add("hidden");
      panel.innerHTML = "";
      return;
    }

    const goals = state.goals.filter(
      (g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );
    const habits = state.habits.filter(
      (h) => h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
    );
    const tasks = state.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.tags.some((tg) => tg.toLowerCase().includes(q))
    );

    panel.classList.remove("hidden");
    const total = goals.length + habits.length + tasks.length;
    if (total === 0) {
      panel.innerHTML = `<div class="text-muted">No matching goals, habits, or tasks for "<strong>${esc(query)}</strong>".</div>`;
      return;
    }

    panel.innerHTML = `
      <div class="panel-header" style="margin-bottom:10px">
        <h3 style="margin:0">Search Results (${total})</h3>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-clear-search">Close</button>
      </div>
      <div class="stack-list">
        ${goals
          .map(
            (g) => `<div class="item-row" style="cursor:pointer" data-open-goal="${esc(g.id)}">
              <span class="badge">Goal</span>
              <span class="item-title">${esc(g.title)}</span>
              <span class="text-muted text-xs">${esc(g.category)}</span>
            </div>`
          )
          .join("")}
        ${habits
          .map(
            (h) => `<div class="item-row" style="cursor:pointer" data-edit-habit="${esc(h.id)}">
              <span class="badge">Habit</span>
              <span class="item-title">${esc(h.title)}</span>
              ${renderGoalPill(h.goalId)}
            </div>`
          )
          .join("")}
        ${tasks.map(renderTaskRow).join("")}
      </div>
    `;
  }

  // --- Master Render ---
  function renderHeaderTitle() {
    const titles = {
      today: [
        "Today's Focus",
        new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      ],
      goals: ["Goals & Milestones", "Define outcomes and track automatic progress from linked habits & tasks"],
      habits: ["Habits & Streaks", "Build daily & weekly consistency linked to your long-term goals"],
      tasks: ["Tasks & Workflow", "Prioritize actions, manage recurring work, and switch between List or Board"],
    };
    const [title, sub] = titles[ui.activeView] || titles.today;
    document.getElementById("view-title").textContent = title;
    document.getElementById("view-subtitle").textContent = sub;
  }

  function renderAll() {
    renderHeaderTitle();
    renderNavigationAndSelects();
    renderTodayView();
    renderGoalsView();
    renderHabitsView();
    renderTasksView();
    if (!document.getElementById("modal-goal-detail").classList.contains("hidden") && ui.activeDetailGoalId) {
      if (getGoalById(ui.activeDetailGoalId)) {
        openGoalDetailModal(ui.activeDetailGoalId);
      } else {
        closeModal("modal-goal-detail");
      }
    }
  }

  // --- Modals & Forms ---
  function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
  }

  function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
    if (id === "modal-goal-detail") ui.activeDetailGoalId = null;
  }

  // Goal Form
  function renderMilestonesEditor() {
    const ul = document.getElementById("goal-milestones-editor");
    ul.innerHTML = ui.editingMilestones
      .map(
        (m, idx) => `
      <li>
        <label style="display:flex;align-items:center;gap:8px;flex:1;cursor:pointer">
          <input type="checkbox" ${m.completed ? "checked" : ""} data-edit-ms-toggle="${idx}" />
          <span>${esc(m.title)}</span>
        </label>
        <button type="button" class="btn btn-icon btn-ghost" data-edit-ms-remove="${idx}" aria-label="Remove milestone">&times;</button>
      </li>`
      )
      .join("");
  }

  function openGoalModal(goalId) {
    const g = goalId ? getGoalById(goalId) : null;
    document.getElementById("modal-goal-title").textContent = g ? "Edit Goal" : "New Goal";
    document.getElementById("goal-id").value = g ? g.id : "";
    document.getElementById("goal-title").value = g ? g.title : "";
    document.getElementById("goal-category").value = g ? g.category : "Personal";
    document.getElementById("goal-target-date").value = g ? g.targetDate : "";
    document.getElementById("goal-status").value = g ? g.status : "active";
    document.getElementById("goal-color").value = g ? g.color : "#4f46e5";
    document.getElementById("goal-description").value = g ? g.description : "";
    document.getElementById("goal-progress-mode").value = g ? g.progressMode : "auto";
    document.getElementById("goal-manual-progress").value = g ? g.manualProgress : 0;
    document.getElementById("goal-manual-val").textContent = g ? g.manualProgress : 0;
    document.getElementById("goal-manual-progress-wrap").classList.toggle("hidden", (g ? g.progressMode : "auto") !== "manual");

    ui.editingMilestones = g ? g.milestones.map((m) => ({ ...m })) : [];
    renderMilestonesEditor();

    document.getElementById("btn-delete-goal").classList.toggle("hidden", !g);
    openModal("modal-goal");
    setTimeout(() => document.getElementById("goal-title").focus(), 40);
  }

  // Habit Form
  function syncHabitFrequencyFields() {
    const freq = document.getElementById("habit-frequency").value;
    document.getElementById("habit-custom-days-wrap").classList.toggle("hidden", freq !== "custom_days");
    document.getElementById("habit-times-week-wrap").classList.toggle("hidden", freq !== "times_per_week");
  }

  function openHabitModal(habitId, prefillGoalId) {
    renderNavigationAndSelects();
    const h = habitId ? state.habits.find((x) => x.id === habitId) : null;
    document.getElementById("modal-habit-title").textContent = h ? "Edit Habit" : "New Habit";
    document.getElementById("habit-id").value = h ? h.id : "";
    document.getElementById("habit-title").value = h ? h.title : "";
    document.getElementById("habit-goal").value = h ? h.goalId : prefillGoalId || "";
    document.getElementById("habit-color").value = h ? h.color : "#10b981";
    document.getElementById("habit-frequency").value = h ? h.frequencyType : "daily";
    document.getElementById("habit-times-week").value = h ? h.timesPerWeek : 3;
    document.getElementById("habit-description").value = h ? h.description : "";
    document.getElementById("habit-archived").checked = h ? Boolean(h.archived) : false;
    document.getElementById("habit-archive-wrap").classList.toggle("hidden", !h);

    const days = h ? h.customDays : [1, 3, 5];
    document.querySelectorAll("#habit-day-picker input[type='checkbox']").forEach((cb) => {
      cb.checked = days.includes(Number(cb.value));
    });

    syncHabitFrequencyFields();
    document.getElementById("btn-delete-habit").classList.toggle("hidden", !h);
    openModal("modal-habit");
    setTimeout(() => document.getElementById("habit-title").focus(), 40);
  }

  // Task Form
  function openTaskModal(taskId, prefillGoalId) {
    renderNavigationAndSelects();
    const tk = taskId ? state.tasks.find((x) => x.id === taskId) : null;
    document.getElementById("modal-task-title").textContent = tk ? "Edit Task" : "New Task";
    document.getElementById("task-id").value = tk ? tk.id : "";
    document.getElementById("task-title").value = tk ? tk.title : "";
    document.getElementById("task-goal").value = tk ? tk.goalId : prefillGoalId || "";
    document.getElementById("task-priority").value = tk ? tk.priority : "medium";
    document.getElementById("task-due").value = tk ? tk.dueDate : todayStr();
    document.getElementById("task-recurrence").value = tk ? tk.recurrence : "none";
    document.getElementById("task-status").value = tk ? tk.status : "todo";
    document.getElementById("task-tags").value = tk ? tk.tags.join(", ") : "";
    document.getElementById("task-focus").checked = tk ? tk.isFocus : ui.activeView === "today";
    document.getElementById("task-notes").value = tk ? tk.notes : "";

    document.getElementById("btn-delete-task").classList.toggle("hidden", !tk);
    openModal("modal-task");
    setTimeout(() => document.getElementById("task-title").focus(), 40);
  }

  // --- DATA BACKUP: LITE JSON & SQLITE EXPORT / IMPORT ---
  async function checkSqliteServer() {
    const hint = document.getElementById("sqlite-server-hint");
    try {
      const res = await fetch("/api/health", { method: "GET" });
      if (res.ok) {
        ui.sqliteAvailable = true;
        if (hint) {
          hint.textContent = "SQLite bridge active: you can export & import both .json and relational .sqlite files.";
        }
        return true;
      }
    } catch (_) {
      // Static file:// or non-Python server
    }
    ui.sqliteAvailable = false;
    if (hint) {
      hint.textContent = "Tip: Lite .json works everywhere offline. Run `python3 server.py` to also enable native .sqlite database export/import.";
    }
    return false;
  }

  function openDataModal() {
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    const kb = (new Blob([raw]).size / 1024).toFixed(2);
    document.getElementById("data-modal-stats").innerHTML = `
      <span><strong>Storage:</strong> Browser localStorage (${kb} KB)</span>
      <span><strong>Items:</strong> ${state.goals.length} Goals &bull; ${state.habits.length} Habits &bull; ${state.tasks.length} Tasks</span>
    `;
    checkSqliteServer();
    openModal("modal-data");
  }

  function exportJsonLiteFile() {
    const payload = {
      app: "orbit-organizer",
      version: 1,
      exportedAt: new Date().toISOString(),
      goals: state.goals,
      habits: state.habits,
      tasks: state.tasks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orbit-lite-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Exported portable Lite JSON backup file.");
  }

  async function exportSqliteFile() {
    const ok = await checkSqliteServer();
    if (!ok) {
      showToast("SQLite export requires running via server.py — exporting Lite JSON instead!");
      exportJsonLiteFile();
      return;
    }
    try {
      const res = await fetch("/api/export-sqlite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: state.goals, habits: state.habits, tasks: state.tasks }),
      });
      if (!res.ok) throw new Error("SQLite export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orbit-backup-${todayStr()}.sqlite`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Exported SQLite (.sqlite) database file.");
    } catch (err) {
      showToast("Could not generate SQLite file: " + err.message);
    }
  }

  function applyImportedData(incomingRaw, mode) {
    const incoming = normalizeState(incomingRaw);
    if (mode === "replace") {
      state = { ...incoming, isSample: false };
    } else {
      // Merge by ID
      const mergeById = (existingArr, newArr) => {
        const map = new Map(existingArr.map((item) => [item.id, item]));
        newArr.forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      };
      state = {
        version: 1,
        isSample: false,
        updatedAt: new Date().toISOString(),
        goals: mergeById(state.goals, incoming.goals),
        habits: mergeById(state.habits, incoming.habits),
        tasks: mergeById(state.tasks, incoming.tasks),
      };
    }
    saveState();
    renderAll();
    closeModal("modal-data");
    showToast(`Imported ${incoming.goals.length} goals, ${incoming.habits.length} habits, and ${incoming.tasks.length} tasks!`);
  }

  async function handleFileImport(file) {
    if (!file) return;
    const mode = document.getElementById("import-mode").value || "replace";
    const buf = await file.arrayBuffer();
    const headerBytes = new Uint8Array(buf.slice(0, 15));
    const headerStr = new TextDecoder("ascii").decode(headerBytes);
    const isSqlite = headerStr.startsWith("SQLite format 3") || /\.(sqlite|sqlite3|db)$/i.test(file.name);

    if (isSqlite) {
      const ok = await checkSqliteServer();
      if (!ok) {
        showToast("Importing binary .sqlite files requires running via `python3 server.py`.");
        return;
      }
      try {
        const res = await fetch("/api/import-sqlite", {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: buf,
        });
        if (!res.ok) throw new Error("Invalid SQLite database schema");
        const parsed = await res.json();
        applyImportedData(parsed, mode);
      } catch (err) {
        showToast("SQLite import error: " + err.message);
      }
      return;
    }

    try {
      const text = new TextDecoder("utf-8").decode(buf);
      const parsed = JSON.parse(text);
      applyImportedData(parsed, mode);
    } catch (err) {
      showToast("Invalid backup file. Please select a valid .json or .sqlite file.");
    }
  }

  // --- Theme Management ---
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "light";
    setTheme(saved);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    document.getElementById("icon-moon").classList.toggle("hidden", theme === "dark");
    document.getElementById("icon-sun").classList.toggle("hidden", theme !== "dark");
  }

  // --- Event Listeners ---
  function switchView(viewName) {
    ui.activeView = viewName;
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
    });
    document.querySelectorAll(".view-section").forEach((sec) => {
      sec.classList.toggle("active", sec.id === `view-${viewName}`);
    });
    document.getElementById("sidebar").classList.remove("open");
    renderHeaderTitle();
  }

  function initEvents() {
    // Sidebar navigation
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.getAttribute("data-view")));
    });

    document.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.getAttribute("data-goto")));
    });

    document.getElementById("btn-mobile-menu").addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });

    // Theme toggle
    document.getElementById("btn-theme-toggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      setTheme(cur === "dark" ? "light" : "dark");
    });

    // Topbar create buttons
    document.getElementById("btn-new-goal").addEventListener("click", () => openGoalModal(null));
    document.getElementById("btn-new-habit").addEventListener("click", () => openHabitModal(null));
    document.getElementById("btn-new-task").addEventListener("click", () => openTaskModal(null));
    document.getElementById("btn-open-data").addEventListener("click", openDataModal);

    // Demo banner buttons
    document.getElementById("btn-dismiss-banner").addEventListener("click", () => {
      state.isSample = false;
      saveState();
      renderTodayView();
    });

    document.getElementById("btn-clear-demo").addEventListener("click", () => {
      state = { version: 1, isSample: false, updatedAt: new Date().toISOString(), goals: [], habits: [], tasks: [] };
      saveState();
      renderAll();
      showToast("Started fresh with an empty workspace!");
    });

    // Quick task capture bar
    document.getElementById("quick-task-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("quick-task-input");
      const title = input.value.trim();
      if (!title) return;
      state.isSample = false;
      state.tasks.unshift({
        id: uid("tsk"),
        title,
        notes: "",
        goalId: document.getElementById("quick-task-goal").value || "",
        priority: document.getElementById("quick-task-priority").value || "medium",
        status: "todo",
        dueDate: todayStr(),
        isFocus: true,
        recurrence: "none",
        tags: [],
        completedAt: null,
        createdAt: new Date().toISOString(),
      });
      input.value = "";
      saveState();
      renderAll();
      showToast("Added to Today's Focus.");
    });

    // Global Search
    document.getElementById("global-search").addEventListener("input", (e) => {
      renderSearchResults(e.target.value);
    });

    // Filter Controls: Goals
    document.getElementById("goal-status-filter").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-status]");
      if (!btn) return;
      ui.goalStatusFilter = btn.getAttribute("data-status");
      document.querySelectorAll("#goal-status-filter .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
      renderGoalsView();
    });

    document.getElementById("goal-category-filter").addEventListener("change", (e) => {
      ui.goalCategoryFilter = e.target.value;
      renderGoalsView();
    });

    // Filter Controls: Habits
    document.getElementById("habit-filter-group").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      ui.habitFilter = btn.getAttribute("data-filter");
      document.querySelectorAll("#habit-filter-group .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
      renderHabitsView();
    });

    document.getElementById("habit-goal-filter").addEventListener("change", (e) => {
      ui.habitGoalFilter = e.target.value;
      renderHabitsView();
    });

    // Filter Controls: Tasks
    document.getElementById("task-tab-filter").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tab]");
      if (!btn) return;
      ui.taskTab = btn.getAttribute("data-tab");
      document.querySelectorAll("#task-tab-filter .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
      renderTasksView();
    });

    document.getElementById("task-goal-filter").addEventListener("change", (e) => {
      ui.taskGoalFilter = e.target.value;
      renderTasksView();
    });

    document.getElementById("task-priority-filter").addEventListener("change", (e) => {
      ui.taskPriorityFilter = e.target.value;
      renderTasksView();
    });

    document.getElementById("task-layout-toggle").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-layout]");
      if (!btn) return;
      ui.taskLayout = btn.getAttribute("data-layout");
      document.querySelectorAll("#task-layout-toggle .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
      renderTasksView();
    });

    // Delegated Clicks across views & modals
    document.body.addEventListener("click", (e) => {
      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        closeModal(closeBtn.getAttribute("data-close-modal"));
        return;
      }

      if (e.target.classList.contains("modal-backdrop")) {
        e.target.classList.add("hidden");
        return;
      }

      if (e.target.id === "btn-clear-search") {
        document.getElementById("global-search").value = "";
        renderSearchResults("");
        return;
      }

      if (e.target.id === "empty-add-habit") {
        openHabitModal(null);
        return;
      }

      const toggleHabitToday = e.target.closest("[data-toggle-habit-today]");
      if (toggleHabitToday) {
        toggleHabitDate(toggleHabitToday.getAttribute("data-toggle-habit-today"), todayStr());
        return;
      }

      const toggleHabitDay = e.target.closest("[data-habit-toggle-day]");
      if (toggleHabitDay) {
        toggleHabitDate(
          toggleHabitDay.getAttribute("data-habit-toggle-day"),
          toggleHabitDay.getAttribute("data-date")
        );
        return;
      }

      const toggleTask = e.target.closest("[data-toggle-task]");
      if (toggleTask) {
        toggleTaskDone(toggleTask.getAttribute("data-toggle-task"));
        return;
      }

      const starTask = e.target.closest("[data-star-task]");
      if (starTask) {
        toggleTaskFocus(starTask.getAttribute("data-star-task"));
        return;
      }

      const editTask = e.target.closest("[data-edit-task]");
      if (editTask) {
        openTaskModal(editTask.getAttribute("data-edit-task"));
        return;
      }

      const editHabit = e.target.closest("[data-edit-habit]");
      if (editHabit) {
        openHabitModal(editHabit.getAttribute("data-edit-habit"));
        return;
      }

      const editGoal = e.target.closest("[data-edit-goal]");
      if (editGoal) {
        openGoalModal(editGoal.getAttribute("data-edit-goal"));
        return;
      }

      const openGoal = e.target.closest("[data-open-goal]");
      if (openGoal && !e.target.closest("input[type='checkbox']") && !e.target.closest("[data-edit-goal]")) {
        openGoalDetailModal(openGoal.getAttribute("data-open-goal"));
        return;
      }

      const newHabitGoal = e.target.closest("[data-new-habit-for-goal]");
      if (newHabitGoal) {
        openHabitModal(null, newHabitGoal.getAttribute("data-new-habit-for-goal"));
        return;
      }

      const newTaskGoal = e.target.closest("[data-new-task-for-goal]");
      if (newTaskGoal) {
        openTaskModal(null, newTaskGoal.getAttribute("data-new-task-for-goal"));
        return;
      }

      const removeMs = e.target.closest("[data-edit-ms-remove]");
      if (removeMs) {
        const idx = Number(removeMs.getAttribute("data-edit-ms-remove"));
        ui.editingMilestones.splice(idx, 1);
        renderMilestonesEditor();
        return;
      }
    });

    // Delegated Checkbox changes (Milestones)
    document.body.addEventListener("change", (e) => {
      const msCheck = e.target.closest("[data-ms-goal]");
      if (msCheck) {
        toggleGoalMilestone(msCheck.getAttribute("data-ms-goal"), msCheck.getAttribute("data-ms-id"));
        return;
      }

      const editMsToggle = e.target.closest("[data-edit-ms-toggle]");
      if (editMsToggle) {
        const idx = Number(editMsToggle.getAttribute("data-edit-ms-toggle"));
        if (ui.editingMilestones[idx]) {
          ui.editingMilestones[idx].completed = editMsToggle.checked;
        }
      }
    });

    // Edit Goal from Detail Modal
    document.getElementById("btn-edit-from-detail").addEventListener("click", () => {
      const gId = ui.activeDetailGoalId;
      closeModal("modal-goal-detail");
      if (gId) openGoalModal(gId);
    });

    // Goal Form Interactions
    document.getElementById("goal-progress-mode").addEventListener("change", (e) => {
      document.getElementById("goal-manual-progress-wrap").classList.toggle("hidden", e.target.value !== "manual");
    });

    document.getElementById("goal-manual-progress").addEventListener("input", (e) => {
      document.getElementById("goal-manual-val").textContent = e.target.value;
    });

    const addMilestoneFromInput = () => {
      const inp = document.getElementById("new-milestone-input");
      const val = inp.value.trim();
      if (!val) return;
      ui.editingMilestones.push({ id: uid("ms"), title: val, completed: false });
      inp.value = "";
      renderMilestonesEditor();
    };

    document.getElementById("btn-add-milestone").addEventListener("click", addMilestoneFromInput);
    document.getElementById("new-milestone-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addMilestoneFromInput();
      }
    });

    document.getElementById("form-goal").addEventListener("submit", (e) => {
      e.preventDefault();
      // Also capture any un-added milestone text sitting in input
      addMilestoneFromInput();
      const id = document.getElementById("goal-id").value;
      const payload = {
        id: id || uid("goal"),
        title: document.getElementById("goal-title").value.trim(),
        category: document.getElementById("goal-category").value,
        targetDate: document.getElementById("goal-target-date").value,
        status: document.getElementById("goal-status").value,
        color: document.getElementById("goal-color").value,
        description: document.getElementById("goal-description").value.trim(),
        progressMode: document.getElementById("goal-progress-mode").value,
        manualProgress: Number(document.getElementById("goal-manual-progress").value) || 0,
        milestones: ui.editingMilestones,
        createdAt: new Date().toISOString(),
      };
      if (!payload.title) return;
      state.isSample = false;

      if (id) {
        const idx = state.goals.findIndex((g) => g.id === id);
        if (idx >= 0) {
          payload.createdAt = state.goals[idx].createdAt;
          state.goals[idx] = payload;
        }
      } else {
        state.goals.unshift(payload);
      }

      saveState();
      closeModal("modal-goal");
      renderAll();
      showToast(id ? "Goal updated." : "Goal created!");
    });

    document.getElementById("btn-delete-goal").addEventListener("click", () => {
      const id = document.getElementById("goal-id").value;
      if (!id) return;
      state.isSample = false;
      state.goals = state.goals.filter((g) => g.id !== id);
      state.habits.forEach((h) => {
        if (h.goalId === id) h.goalId = "";
      });
      state.tasks.forEach((t) => {
        if (t.goalId === id) t.goalId = "";
      });
      saveState();
      closeModal("modal-goal");
      renderAll();
      showToast("Goal deleted (linked habits & tasks kept as unlinked).");
    });

    // Habit Form Interactions
    document.getElementById("habit-frequency").addEventListener("change", syncHabitFrequencyFields);

    document.getElementById("form-habit").addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("habit-id").value;
      const customDays = Array.from(document.querySelectorAll("#habit-day-picker input:checked")).map((cb) =>
        Number(cb.value)
      );
      const freq = document.getElementById("habit-frequency").value;
      if (freq === "custom_days" && customDays.length === 0) {
        showToast("Please select at least one day of the week.");
        return;
      }

      const existing = id ? state.habits.find((h) => h.id === id) : null;
      const payload = {
        id: id || uid("hab"),
        title: document.getElementById("habit-title").value.trim(),
        goalId: document.getElementById("habit-goal").value || "",
        color: document.getElementById("habit-color").value,
        frequencyType: freq,
        customDays: customDays.length ? customDays : [1, 3, 5],
        timesPerWeek: Math.min(7, Math.max(1, Number(document.getElementById("habit-times-week").value) || 3)),
        description: document.getElementById("habit-description").value.trim(),
        completions: existing ? existing.completions : [],
        archived: existing ? document.getElementById("habit-archived").checked : false,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
      };
      if (!payload.title) return;
      state.isSample = false;

      if (existing) {
        const idx = state.habits.findIndex((h) => h.id === id);
        state.habits[idx] = payload;
      } else {
        state.habits.unshift(payload);
      }

      saveState();
      closeModal("modal-habit");
      renderAll();
      showToast(existing ? "Habit updated." : "Habit created!");
    });

    document.getElementById("btn-delete-habit").addEventListener("click", () => {
      const id = document.getElementById("habit-id").value;
      if (!id) return;
      state.isSample = false;
      state.habits = state.habits.filter((h) => h.id !== id);
      saveState();
      closeModal("modal-habit");
      renderAll();
      showToast("Habit deleted.");
    });

    // Task Form Interactions
    document.getElementById("form-task").addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("task-id").value;
      const existing = id ? state.tasks.find((t) => t.id === id) : null;
      const newStatus = document.getElementById("task-status").value;
      const tags = document
        .getElementById("task-tags")
        .value.split(",")
        .map((s) => s.trim().replace(/^#/, ""))
        .filter(Boolean);

      const payload = {
        id: id || uid("tsk"),
        title: document.getElementById("task-title").value.trim(),
        goalId: document.getElementById("task-goal").value || "",
        priority: document.getElementById("task-priority").value,
        dueDate: document.getElementById("task-due").value,
        recurrence: document.getElementById("task-recurrence").value,
        status: newStatus,
        tags,
        isFocus: document.getElementById("task-focus").checked,
        notes: document.getElementById("task-notes").value.trim(),
        completedAt:
          newStatus === "done"
            ? (existing && existing.completedAt) || new Date().toISOString()
            : null,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
      };
      if (!payload.title) return;
      state.isSample = false;

      if (existing) {
        const idx = state.tasks.findIndex((t) => t.id === id);
        state.tasks[idx] = payload;
      } else {
        state.tasks.unshift(payload);
      }

      saveState();
      closeModal("modal-task");
      renderAll();
      showToast(existing ? "Task updated." : "Task added!");
    });

    document.getElementById("btn-delete-task").addEventListener("click", () => {
      const id = document.getElementById("task-id").value;
      if (!id) return;
      state.isSample = false;
      state.tasks = state.tasks.filter((t) => t.id !== id);
      saveState();
      closeModal("modal-task");
      renderAll();
      showToast("Task deleted.");
    });

    // Data Modal Actions
    document.getElementById("btn-export-json").addEventListener("click", exportJsonLiteFile);
    document.getElementById("btn-export-sqlite").addEventListener("click", exportSqliteFile);

    document.getElementById("input-import-file").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleFileImport(file);
        e.target.value = "";
      }
    });

    document.getElementById("btn-load-sample").addEventListener("click", () => {
      state = createSampleData();
      saveState();
      closeModal("modal-data");
      renderAll();
      showToast("Starter sample workspace loaded.");
    });

    document.getElementById("btn-reset-all").addEventListener("click", () => {
      if (!window.confirm("Clear all goals, habits, and tasks from browser storage? Consider exporting a backup file first.")) {
        return;
      }
      state = { version: 1, isSample: false, updatedAt: new Date().toISOString(), goals: [], habits: [], tasks: [] };
      saveState();
      closeModal("modal-data");
      renderAll();
      showToast("All browser storage cleared.");
    });

    // Escape key closes open modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop:not(.hidden)").forEach((m) => m.classList.add("hidden"));
      }
    });
  }

  // Boot
  initTheme();
  initEvents();
  renderAll();
})();
