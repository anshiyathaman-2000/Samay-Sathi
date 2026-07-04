/* =========================================================
   SAMAY SAATHI — app.js
   Single-file app: state, AI scoring engine, scheduler,
   voice input, notifications, analytics. No backend needed.
   ========================================================= */

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    tagline: "Your AI companion before every deadline",
    prodScore: "Productivity",
    atRisk: "at risk",
    addTask: "➕ Add a task",
    lblTitle: "Task title",
    lblDeadline: "Deadline",
    lblDuration: "Est. time needed (min)",
    lblCategory: "Category",
    catAcademic: "Academic",
    catWork: "Work",
    catBill: "Bill / Payment",
    catInterview: "Interview",
    catPersonal: "Personal",
    lblImportance: "How important is this?",
    btnAdd: "Add task — let AI prioritize",
    workHours: "⚙️ Working hours (used for auto-scheduling)",
    lblStart: "Start",
    lblEnd: "End",
    btnSave: "Save",
    habits: "🔥 Goals & habits",
    btnAddShort: "Add",
    aiInsight: "AI Insight",
    autoSchedule: "📅 AI auto-schedule (next 7 days)",
    autoScheduleSub: "Tasks placed automatically into free time before their deadline",
    calendar: "🗓️ Calendar",
    analytics: "📊 Analytics",
    completedLabel: "tasks completed",
    legCritical: "Critical",
    legHigh: "High",
    legMedium: "Medium",
    legLow: "Low",
    reminders: "🔔 Reminder feed",
    noReminders: "No reminders yet",
    noTasks: "No tasks yet. Add one on the left, or use the mic 🎤",
    markDone: "Mark done",
    deleteTask: "Delete",
    atRiskBanner: t => `⚠️ ${t} task(s) cannot be fully completed before their deadline at this pace. Consider reducing scope or starting now.`,
    insightCritical: (n, title) => `You have ${n} critical task(s) today. Start with "${title}" — time is almost up.`,
    insightHigh: n => `${n} high-priority task(s) need attention soon. Plan focused blocks today.`,
    insightCalm: () => `You're on track. No urgent fires right now — good time to work ahead on upcoming tasks.`,
    insightDone: () => `All caught up! Add a new task or check in on your habits.`,
    reasonOverdue: "Overdue! Finish this right away.",
    reasonH6: h => `Only ${h}h left — start now.`,
    reasonH24: h => `Due today, ${h}h remaining.`,
    reasonDays: d => `${d} day(s) left — plan your slot.`,
    reasonChill: "Plenty of time — scheduled automatically.",
    micUnsupported: "Voice input isn't supported in this browser. Try Chrome on desktop or Android.",
    toastAdded: "Task added and prioritized by AI",
    toastDone: "Marked complete 🎉",
    toastNudge: "Nudge sent",
    habitDone: "checked in",
    streakOf: "day streak"
  },
  hi: {
    tagline: "Har deadline se pehle, aapka AI saathi",
    prodScore: "Productivity",
    atRisk: "risk mein",
    addTask: "➕ Naya task jodein",
    lblTitle: "Task ka naam",
    lblDeadline: "Deadline",
    lblDuration: "Lagne wala samay (minute)",
    lblCategory: "Category",
    catAcademic: "Padhai",
    catWork: "Kaam",
    catBill: "Bill / Payment",
    catInterview: "Interview",
    catPersonal: "Personal",
    lblImportance: "Yeh kitna important hai?",
    btnAdd: "Task jodein — AI prioritize karega",
    workHours: "⚙️ Working hours (auto-schedule ke liye)",
    lblStart: "Shuru",
    lblEnd: "Khatam",
    btnSave: "Save karein",
    habits: "🔥 Goals aur habits",
    btnAddShort: "Jodein",
    aiInsight: "AI Salah",
    autoSchedule: "📅 AI auto-schedule (aane wale 7 din)",
    autoScheduleSub: "Tasks deadline se pehle free time mein automatically rakhe jaate hain",
    calendar: "🗓️ Calendar",
    analytics: "📊 Analytics",
    completedLabel: "tasks complete hue",
    legCritical: "Critical",
    legHigh: "Zaroori",
    legMedium: "Medium",
    legLow: "Aaraam se",
    reminders: "🔔 Reminder feed",
    noReminders: "Abhi koi reminder nahi",
    noTasks: "Abhi koi task nahi hai. Left side se jodein, ya 🎤 mic use karein",
    markDone: "Pura hua",
    deleteTask: "Hatayein",
    atRiskBanner: t => `⚠️ Is raftaar se ${t} task(s) deadline se pehle pura nahi ho payega. Scope kam karein ya abhi shuru karein.`,
    insightCritical: (n, title) => `Aaj ${n} critical task hai. "${title}" se shuru karein — samay bahut kam bacha hai.`,
    insightHigh: n => `${n} high-priority task(s) par dhyaan dein. Aaj focused time rakhein.`,
    insightCalm: () => `Sab theek hai! Abhi koi urgent kaam nahi — aage ke tasks par kaam kar sakte hain.`,
    insightDone: () => `Sab kaam ho gaya! Naya task jodein ya habits check karein.`,
    reasonOverdue: "Deadline nikal gayi! Turant complete karein.",
    reasonH6: h => `Sirf ${h} ghante bache — abhi shuru karein.`,
    reasonH24: h => `Aaj hi karna hoga, ${h} ghante bache hain.`,
    reasonDays: d => `${d} din bache hain — plan kar lein.`,
    reasonChill: "Abhi time hai — schedule mein rakh diya gaya hai.",
    micUnsupported: "Is browser mein voice input nahi chalega. Chrome (desktop/Android) try karein.",
    toastAdded: "Task add ho gaya, AI ne prioritize kar diya",
    toastDone: "Pura ho gaya 🎉",
    toastNudge: "Reminder bheja gaya",
    habitDone: "check-in hua",
    streakOf: "din ka streak"
  }
};

let LANG = localStorage.getItem('ss_lang') || 'en';

function t(key, ...args) {
  const v = I18N[LANG][key] ?? I18N.en[key];
  return typeof v === 'function' ? v(...args) : v;
}

function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[LANG][key]) el.textContent = I18N[LANG][key];
  });
}

/* ---------------- State ---------------- */
const STORE_KEY = 'ss_state_v1';

function loadState() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) { try { return JSON.parse(raw); } catch (e) { /* fall through to seed */ } }
  return seedState();
}

function seedState() {
  const now = Date.now();
  const h = 3600000;
  return {
    settings: { workStart: "09:00", workEnd: "21:00" },
    tasks: [
      { id: cid(), title: "Submit GST return", category: "bill", deadline: new Date(now + 4 * h).toISOString(), estMinutes: 90, importance: 5, status: "pending", createdAt: now, notified: [] },
      { id: cid(), title: "Finish DBMS assignment", category: "academic", deadline: new Date(now + 22 * h).toISOString(), estMinutes: 120, importance: 4, status: "pending", createdAt: now, notified: [] },
      { id: cid(), title: "Mock interview prep", category: "interview", deadline: new Date(now + 3 * 24 * h).toISOString(), estMinutes: 90, importance: 5, status: "pending", createdAt: now, notified: [] },
      { id: cid(), title: "Pay electricity bill", category: "bill", deadline: new Date(now + 30 * h).toISOString(), estMinutes: 15, importance: 3, status: "pending", createdAt: now, notified: [] },
      { id: cid(), title: "Clean inbox / follow-ups", category: "work", deadline: new Date(now + 6 * 24 * h).toISOString(), estMinutes: 45, importance: 2, status: "pending", createdAt: now, notified: [] },
    ],
    habits: [
      { id: cid(), name: "Daily DSA practice", streak: 3, lastDate: isoDate(new Date(now - 1 * 24 * h)) },
      { id: cid(), name: "30 min revision", streak: 0, lastDate: null },
    ],
    completedLog: [],
    feed: []
  };
}

function cid() { return 'id_' + Math.random().toString(36).slice(2, 10); }
function isoDate(d) { return d.toISOString().slice(0, 10); }

let STATE = loadState();
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(STATE)); }

/* ---------------- AI Priority Engine ----------------
   Transparent, rule-based scoring (0-100) combining:
   - Urgency (time left vs now)
   - Importance (user-set 1-5)
   - Effort risk (estimated effort vs remaining capacity)
   This is intentionally explainable so users trust *why*
   a task was prioritized — not a black box.
------------------------------------------------------ */
function hoursLeft(task) { return (new Date(task.deadline).getTime() - Date.now()) / 3600000; }

function priorityScore(task) {
  const hl = hoursLeft(task);
  let urgency;
  if (hl <= 0)   urgency = 50;
  else if (hl <= 6)   urgency = 46;
  else if (hl <= 24)  urgency = 38;
  else if (hl <= 72)  urgency = 26;
  else if (hl <= 168) urgency = 14;
  else urgency = 5;

  const importance = task.importance * 6; // 1..5 -> 6..30

  const capacityMin = Math.max(hl, 0.1) * 60;
  const effortRatio = task.estMinutes / capacityMin;
  let effort;
  if (hl <= 0)              effort = 20;
  else if (effortRatio > 0.5)  effort = 20;
  else if (effortRatio > 0.25) effort = 14;
  else if (effortRatio > 0.1)  effort = 8;
  else effort = 3;

  const score = Math.min(100, urgency + importance + effort);
  return { score, hoursLeft: hl };
}

function priorityLabel(score) {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

function reasonText(hl) {
  if (hl <= 0)   return t('reasonOverdue');
  if (hl <= 6)   return t('reasonH6', Math.max(1, Math.round(hl)));
  if (hl <= 24)  return t('reasonH24', Math.round(hl));
  if (hl <= 168) return t('reasonDays', Math.round(hl / 24));
  return t('reasonChill');
}

/* ---------------- Auto-scheduler ----------------
   Greedy bin-packing: highest-score tasks first, placed
   into free working-hour capacity on each day up to their
   deadline. Flags tasks that can't fit ("at risk") so the
   user gets a proactive warning instead of a missed deadline.
--------------------------------------------------- */
function workMinutesPerDay() {
  const [sh, sm] = STATE.settings.workStart.split(':').map(Number);
  const [eh, em] = STATE.settings.workEnd.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

function buildSchedule() {
  const cap = workMinutesPerDay();
  const days = 7;
  const alloc = {};
  const pending = STATE.tasks
    .filter(x => x.status !== 'done')
    .map(x => ({ ...x, _s: priorityScore(x) }))
    .sort((a, b) => b._s.score - a._s.score);

  const atRisk = [];
  for (const task of pending) {
    let remaining = task.estMinutes;
    const deadline = new Date(task.deadline);
    for (let d = 0; d < days && remaining > 0; d++) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() + d);
      if (dayStart > deadline) break;
      const key = isoDate(dayStart);
      alloc[key] = alloc[key] || { usedMin: 0, blocks: [] };
      const free = cap - alloc[key].usedMin;
      if (free <= 0) continue;
      const give = Math.min(free, remaining);
      alloc[key].blocks.push({ title: task.title, minutes: give });
      alloc[key].usedMin += give;
      remaining -= give;
    }
    if (remaining > 0) atRisk.push(task.title);
  }
  return { alloc, atRisk, cap };
}

/* ---------------- Rendering ---------------- */
function renderAll() {
  applyStaticI18n();
  renderTasks();
  renderSchedule();
  renderCalendar();
  renderAnalytics();
  renderHabits();
  renderInsight();
  renderFeed();
}

function ringColor(label) {
  return { critical: 'var(--p-critical)', high: 'var(--p-high)', medium: 'var(--p-medium)', low: 'var(--p-low)' }[label];
}

function catEmoji(cat) {
  return { academic: '📚', work: '💼', bill: '🧾', interview: '🎯', personal: '🌱' }[cat] || '📌';
}

function fmtDeadline(iso) {
  const d = new Date(iso);
  return d.toLocaleString(LANG === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function renderTasks() {
  const wrap = document.getElementById('taskListWrap');
  const pending = STATE.tasks.filter(x => x.status !== 'done');
  if (pending.length === 0 && STATE.tasks.length === 0) {
    wrap.innerHTML = `<div class="card"><div class="empty-state">${t('noTasks')}</div></div>`;
    return;
  }
  const groups = { critical: [], high: [], medium: [], low: [] };
  STATE.tasks.forEach(task => {
    const { score, hoursLeft: hl } = priorityScore(task);
    const label = task.status === 'done' ? 'done' : priorityLabel(score);
    if (label === 'done') return;
    groups[label].push({ task, score, hl });
  });
  Object.values(groups).forEach(g => g.sort((a, b) => b.score - a.score));

  const labelText = { critical: t('legCritical'), high: t('legHigh'), medium: t('legMedium'), low: t('legLow') };
  let html = '';
  ['critical', 'high', 'medium', 'low'].forEach(label => {
    if (groups[label].length === 0) return;
    html += `<div class="section-label"><span class="sw" style="background:${ringColor(label)}"></span> ${labelText[label]} (${groups[label].length})</div>`;
    groups[label].forEach(({ task, score, hl }) => {
      const pct = Math.max(0, Math.min(100, 100 - (hl < 0 ? 0 : Math.min(hl, 168) / 168 * 100)));
      const circumference = 2 * Math.PI * 16;
      const offset = circumference - (pct / 100) * circumference;
      html += `
      <div class="task-card" data-id="${task.id}">
        <div class="ring-wrap">
          <svg width="50" height="50" viewBox="0 0 40 40">
            <circle class="ring-bg" cx="20" cy="20" r="16"></circle>
            <circle class="ring-fg" cx="20" cy="20" r="16" stroke="${ringColor(label)}"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
          </svg>
          <div class="ring-label">${hl <= 0 ? '⏰' : Math.max(0, Math.round(hl)) + 'h'}</div>
        </div>
        <div class="task-body">
          <div class="task-top">
            <span class="task-title">${catEmoji(task.category)} ${escapeHtml(task.title)}</span>
            <span class="tag" style="background:${ringColor(label)}22; color:${ringColor(label)}">${labelText[label]}</span>
          </div>
          <div class="task-reason">${reasonText(hl)}</div>
          <div class="task-meta">${fmtDeadline(task.deadline)} · ${task.estMinutes}min</div>
        </div>
        <div class="task-actions">
          <button class="icon-btn" title="${t('markDone')}" data-action="done" data-id="${task.id}">✓</button>
          <button class="icon-btn" title="${t('deleteTask')}" data-action="del" data-id="${task.id}">✕</button>
        </div>
      </div>`;
    });
  });
  if (html === '') html = `<div class="card"><div class="empty-state">${t('noTasks')}</div></div>`;
  wrap.innerHTML = html;

  wrap.querySelectorAll('[data-action="done"]').forEach(b => b.onclick = () => markDone(b.dataset.id));
  wrap.querySelectorAll('[data-action="del"]').forEach(b => b.onclick = () => deleteTask(b.dataset.id));
}

function markDone(id) {
  const task = STATE.tasks.find(x => x.id === id);
  if (!task) return;
  task.status = 'done';
  STATE.completedLog.push(new Date().toISOString());
  save(); renderAll();
  showToast(t('toastDone'));
}

function deleteTask(id) {
  STATE.tasks = STATE.tasks.filter(x => x.id !== id);
  save(); renderAll();
}

function renderSchedule() {
  const { alloc, atRisk, cap } = buildSchedule();
  const grid = document.getElementById('weekGrid');
  let html = '';
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesHi = ['Ravi', 'Som', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani'];
  for (let d = 0; d < 7; d++) {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    const key = isoDate(dt);
    const data = alloc[key] || { usedMin: 0, blocks: [] };
    const pctUsed = cap > 0 ? Math.min(100, (data.usedMin / cap) * 100) : 0;
    const fillClass = pctUsed > 90 ? 'over' : (pctUsed > 60 ? 'warn' : '');
    const dname = (LANG === 'hi' ? dayNamesHi : dayNamesEn)[dt.getDay()];
    html += `
    <div class="day-col">
      <div class="dname">${dname}</div>
      <div class="ddate">${dt.getDate()}/${dt.getMonth() + 1}</div>
      <div class="cap-bar"><div class="cap-fill ${fillClass}" style="width:${pctUsed}%"></div></div>
      ${data.blocks.map(b => `<div class="block">${escapeHtml(b.title.slice(0, 16))}${b.title.length > 16 ? '…' : ''}<br>${b.minutes}m</div>`).join('') || `<div class="muted small">—</div>`}
    </div>`;
  }
  grid.innerHTML = html;

  const riskWrap = document.getElementById('riskBannerWrap');
  if (atRisk.length > 0) {
    riskWrap.innerHTML = `<div class="at-risk-banner">${t('atRiskBanner', atRisk.length)}</div>`;
  } else {
    riskWrap.innerHTML = '';
  }
  document.getElementById('atRiskChip').style.display = atRisk.length > 0 ? 'flex' : 'none';
  document.getElementById('atRiskCount').textContent = atRisk.length;
}

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('calMonthLabel').textContent = `${monthNamesEn[month]} ${year}`;

  const tasksByDate = {};
  STATE.tasks.forEach(tk => {
    const key = isoDate(new Date(tk.deadline));
    tasksByDate[key] = (tasksByDate[key] || 0) + 1;
  });

  const wds = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  let html = wds.map(w => `<div class="wd">${w}</div>`).join('');
  for (let i = 0; i < startDay; i++) html += `<div class="cal-cell"></div>`;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const key = isoDate(dateObj);
    const isToday = key === isoDate(now);
    const count = tasksByDate[key] || 0;
    html += `<div class="cal-cell ${isToday ? 'today' : ''}">${day}${count > 0 ? `<div class="dots">${'<span></span>'.repeat(Math.min(count, 3))}</div>` : ''}</div>`;
  }
  document.getElementById('calGrid').innerHTML = html;
}

function renderAnalytics() {
  const total = STATE.tasks.length;
  const done = STATE.tasks.filter(x => x.status === 'done').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const circumference = 213.6;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById('donutFg').setAttribute('stroke-dashoffset', offset);
  document.getElementById('donutPct').textContent = pct + '%';

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  STATE.tasks.filter(x => x.status !== 'done').forEach(tk => {
    const { score } = priorityScore(tk);
    counts[priorityLabel(score)]++;
  });
  document.getElementById('legCritCount').textContent = counts.critical;
  document.getElementById('legHighCount').textContent = counts.high;
  document.getElementById('legMedCount').textContent = counts.medium;
  document.getElementById('legLowCount').textContent = counts.low;

  const bars = document.getElementById('weekBars');
  const buckets = [];
  for (let d = 6; d >= 0; d--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    const key = isoDate(dt);
    const count = STATE.completedLog.filter(c => c.slice(0, 10) === key).length;
    buckets.push({ key, count, label: dt.getDate() });
  }
  const max = Math.max(1, ...buckets.map(b => b.count));
  bars.innerHTML = buckets.map(b => `
    <div style="flex:1; text-align:center;">
      <div class="bar" style="height:60px;"><div class="fill" style="height:${(b.count / max) * 100}%"></div></div>
      <div class="bar-label">${b.label}</div>
    </div>`).join('');

  const habitsToday = STATE.habits.filter(h => h.lastDate === isoDate(new Date())).length;
  const habitPct = STATE.habits.length > 0 ? habitsToday / STATE.habits.length : 0;
  const prodScore = Math.round((total > 0 ? done / total : 0) * 60 + habitPct * 40);
  document.getElementById('prodScoreVal').textContent = prodScore + '%';
  document.getElementById('prodDot').style.background = prodScore >= 60 ? 'var(--teal)' : (prodScore >= 30 ? 'var(--amber)' : 'var(--red)');
}

function renderHabits() {
  const wrap = document.getElementById('habitList');
  if (STATE.habits.length === 0) {
    wrap.innerHTML = `<div class="empty-state small">—</div>`;
    return;
  }
  const today = isoDate(new Date());
  wrap.innerHTML = STATE.habits.map(h => {
    const checked = h.lastDate === today;
    return `
    <div class="habit-row">
      <button class="check-btn ${checked ? 'checked' : ''}" data-id="${h.id}">${checked ? '✓' : ''}</button>
      <span class="habit-name">${escapeHtml(h.name)}</span>
      <span class="streak">🔥 ${h.streak}</span>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.check-btn').forEach(b => b.onclick = () => checkInHabit(b.dataset.id));
}

function checkInHabit(id) {
  const h = STATE.habits.find(x => x.id === id);
  if (!h) return;
  const today = isoDate(new Date());
  if (h.lastDate === today) return;
  const yesterday = isoDate(new Date(Date.now() - 86400000));
  h.streak = (h.lastDate === yesterday) ? h.streak + 1 : 1;
  h.lastDate = today;
  save(); renderHabits(); renderAnalytics();
  showToast(`${h.name}: ${t('habitDone')} — ${h.streak} ${t('streakOf')}`);
}

function renderInsight() {
  const pending = STATE.tasks.filter(x => x.status !== 'done').map(tk => ({ tk, ...priorityScore(tk) }));
  const critical = pending.filter(p => priorityLabel(p.score) === 'critical');
  const high = pending.filter(p => priorityLabel(p.score) === 'high');
  let msg;
  if (pending.length === 0) msg = t('insightDone');
  else if (critical.length > 0) msg = t('insightCritical', critical.length, critical[0].tk.title);
  else if (high.length > 0) msg = t('insightHigh', high.length);
  else msg = t('insightCalm');
  document.getElementById('insightText').textContent = msg;
}

function renderFeed() {
  const list = document.getElementById('feedList');
  if (STATE.feed.length === 0) {
    list.innerHTML = `<div class="empty-state">${t('noReminders')}</div>`;
    return;
  }
  list.innerHTML = STATE.feed.slice(-12).reverse().map(f => `
    <div class="feed-item"><span class="ftime">${new Date(f.time).toLocaleTimeString(LANG === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}</span><span>${escapeHtml(f.msg)}</span></div>
  `).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------- Toasts ---------------- */
function showToast(msg) {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

/* ---------------- Context-aware reminder engine ----------------
   Checks every 60s. Fires a nudge once per threshold crossing
   (24h / 6h / 1h remaining) per task — not a dumb repeating alarm.
------------------------------------------------------------------- */
const THRESHOLDS = [24, 6, 1];

function checkReminders() {
  const now = Date.now();
  STATE.tasks.filter(x => x.status !== 'done').forEach(task => {
    const hl = hoursLeft(task);
    THRESHOLDS.forEach(th => {
      if (hl <= th && hl > 0 && !task.notified.includes(th)) {
        task.notified.push(th);
        const msg = `${task.title}: ${reasonText(hl)}`;
        STATE.feed.push({ time: now, msg });
        showToast('⏰ ' + msg);
        if (window.Notification && Notification.permission === 'granted') {
          try { new Notification('Samay Saathi', { body: msg }); } catch (e) {}
        }
      }
    });
  });
  save(); renderFeed();
}

if (window.Notification && Notification.permission === 'default') {
  Notification.requestPermission().catch(() => {});
}
setInterval(checkReminders, 60000);

/* ---------------- Voice input (Web Speech API) ----------------
   Lightweight keyword parser: extracts "today/tomorrow/in N
   hours/days" and a clock time, pre-fills the form for the
   user to confirm — never auto-submits without review.
------------------------------------------------------------------ */
const micBtn = document.getElementById('micBtn');
const voicePreview = document.getElementById('voicePreview');
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;

if (SpeechRec) {
  recognition = new SpeechRec();
  recognition.lang = LANG === 'hi' ? 'hi-IN' : 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    voicePreview.textContent = '🎤 "' + transcript + '"';
    parseVoiceIntoForm(transcript);
  };
  recognition.onend = () => { listening = false; micBtn.classList.remove('listening'); };
  recognition.onerror = () => { listening = false; micBtn.classList.remove('listening'); };
}

micBtn.onclick = () => {
  if (!recognition) { alert(t('micUnsupported')); return; }
  if (listening) { recognition.stop(); return; }
  recognition.lang = LANG === 'hi' ? 'hi-IN' : 'en-IN';
  listening = true;
  micBtn.classList.add('listening');
  voicePreview.textContent = '';
  try { recognition.start(); } catch (e) {}
};

function parseVoiceIntoForm(text) {
  document.getElementById('tTitle').value = text.replace(/\b(tomorrow|today|at \d{1,2}(:\d{2})?\s*(am|pm)?|in \d+ (hours?|days?))\b/gi, '').trim() || text;
  const now = new Date();
  let deadline = new Date(now.getTime() + 24 * 3600000);
  const lower = text.toLowerCase();
  const inMatch = lower.match(/in (\d+)\s*(hour|day)/);
  const atMatch = lower.match(/at (\d{1,2})(:(\d{2}))?\s*(am|pm)?/);
  if (lower.includes('today')) deadline = new Date(now);
  if (lower.includes('tomorrow')) deadline = new Date(now.getTime() + 24 * 3600000);
  if (inMatch) {
    const n = parseInt(inMatch[1], 10);
    deadline = new Date(now.getTime() + n * (inMatch[2].startsWith('day') ? 86400000 : 3600000));
  }
  if (atMatch) {
    let hh = parseInt(atMatch[1], 10);
    const mm = atMatch[3] ? parseInt(atMatch[3], 10) : 0;
    const ap = atMatch[4];
    if (ap === 'pm' && hh < 12) hh += 12;
    deadline.setHours(hh, mm, 0, 0);
  } else {
    deadline.setHours(18, 0, 0, 0);
  }
  document.getElementById('tDeadline').value = toLocalInputValue(deadline);
  if (lower.includes('urgent') || lower.includes('important') || lower.includes('zaroori')) {
    document.getElementById('tImportance').value = 5;
    document.getElementById('impBadge').textContent = 5;
  }
}

function toLocalInputValue(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ---------------- Form handlers ---------------- */
document.getElementById('tImportance').addEventListener('input', (e) => {
  document.getElementById('impBadge').textContent = e.target.value;
});

document.getElementById('taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('tTitle').value.trim();
  const deadlineVal = document.getElementById('tDeadline').value;
  if (!title || !deadlineVal) return;
  const task = {
    id: cid(),
    title,
    category: document.getElementById('tCategory').value,
    deadline: new Date(deadlineVal).toISOString(),
    estMinutes: parseInt(document.getElementById('tDuration').value, 10) || 30,
    importance: parseInt(document.getElementById('tImportance').value, 10),
    status: 'pending',
    createdAt: Date.now(),
    notified: []
  };
  STATE.tasks.push(task);
  save();
  e.target.reset();
  document.getElementById('tDuration').value = 60;
  document.getElementById('tImportance').value = 3;
  document.getElementById('impBadge').textContent = 3;
  voicePreview.textContent = '';
  renderAll();
  showToast(t('toastAdded'));
});

document.getElementById('addHabitBtn').onclick = () => {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;
  STATE.habits.push({ id: cid(), name, streak: 0, lastDate: null });
  input.value = '';
  save(); renderHabits();
};

document.getElementById('habitInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addHabitBtn').click(); }
});

document.getElementById('saveSettings').onclick = () => {
  STATE.settings.workStart = document.getElementById('setStart').value;
  STATE.settings.workEnd = document.getElementById('setEnd').value;
  save(); renderSchedule();
  showToast('Settings saved');
};

document.getElementById('langEn').onclick = () => setLang('en');
document.getElementById('langHi').onclick = () => setLang('hi');

function setLang(l) {
  LANG = l;
  localStorage.setItem('ss_lang', l);
  document.getElementById('langEn').classList.toggle('active', l === 'en');
  document.getElementById('langHi').classList.toggle('active', l === 'hi');
  document.documentElement.lang = l;
  renderAll();
}
setLang(LANG);

/* ---------------- Init ---------------- */
document.getElementById('setStart').value = STATE.settings.workStart;
document.getElementById('setEnd').value = STATE.settings.workEnd;
renderAll();
checkReminders();
setInterval(renderAll, 30000); // keep countdown rings & insight fresh
