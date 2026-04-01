import { useState, useEffect } from "react";
import { fetchHabits, fetchChecks, createHabit, deleteHabit, updateHabit, toggleCheck } from "../../api";
import "./Home.css";

/* ---------------- UTIL ---------------- */

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function makeKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/* ---------------- COMPONENT ---------------- */

export default function Home() {
  const now         = new Date();
  const year        = now.getFullYear();
  const month       = now.getMonth();
  const monthName   = now.toLocaleString("en-US", { month: "long" });
  const daysInMonth = getDaysInMonth(year, month);
  const today       = todayKey();

  const [habits, setHabits]   = useState([]);
  const [checks, setChecks]   = useState({});
  const [loading, setLoading] = useState(true);
  const [clock,   setClock]   = useState("");
  const [timer,   setTimer]   = useState({});

  /* -------- LOAD DATA -------- */
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const habitList = await fetchHabits();
      setHabits(habitList);

      const allChecks = {};
      for (const habit of habitList) {
        const checkList = await fetchChecks(habit.id);
        allChecks[habit.id] = {};
        checkList.forEach(c => {
          allChecks[habit.id][c.checkedDate] = true;
        });
      }
      setChecks(allChecks);
      setLoading(false);
    }
    loadAll();
  }, []);

  /* -------- CLOCK -------- */
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(n.toLocaleTimeString("en-US", { hour12: false }));

      const timers = {};
      habits.forEach((habit, idx) => {
        if (habit.time) {
          const [hh, mm] = habit.time.split(":").map(Number);
          const habitTime = new Date();
          habitTime.setHours(hh, mm, 0);
          let msUntil = habitTime.getTime() - n.getTime();
          if (msUntil < 0) msUntil += 86400000;
          const hours   = Math.floor(msUntil / 3600000);
          const minutes = Math.floor((msUntil % 3600000) / 60000);
          const seconds = Math.floor((msUntil % 60000) / 1000);
          timers[idx]   = { hours, minutes, seconds, msUntil };
        }
      });
      setTimer(timers);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [habits]);

  /* -------- HABIT ACTIONS -------- */

  const addHabit = async () => {
    const name = prompt("Enter habit name:");
    if (!name) return;
    const icon = prompt("Enter icon (optional):") || "•";
    const time = prompt("Enter time (HH:MM):") || "08:00";
    const saved = await createHabit({ name, icon, time });
    setHabits(prev => [...prev, saved]);
  };

  // ✅ FIX: use habit.id not index
  const removeHabit = async (habitId) => {
    if (!window.confirm("Delete this habit?")) return;
    await deleteHabit(habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const editHabitTime = async (habit) => {
    const newTime = prompt("Edit time (HH:MM):", habit.time || "08:00");
    if (newTime && /^\d{2}:\d{2}$/.test(newTime)) {
      const updated = await updateHabit(habit.id, { ...habit, time: newTime });
      setHabits(prev => prev.map(h => h.id === habit.id ? updated : h));
    } else if (newTime) {
      alert("Invalid time format. Use HH:MM (e.g., 07:00)");
    }
  };

  /* -------- TIMER FORMAT -------- */

  const formatTimer = (hIdx) => {
    const t = timer[hIdx];
    if (!t) return "";
    if (t.msUntil < 60000)  return `${t.minutes}m ${t.seconds}s`;
    if (t.hours === 0)       return `${t.minutes}m`;
    return `${t.hours}h ${t.minutes}m`;
  };

  const getTimerClass = (hIdx) => {
    const t = timer[hIdx];
    if (!t) return "";
    if (t.msUntil < 300000)  return "urgent";
    if (t.msUntil < 1800000) return "warning";
    return "";
  };

  /* -------- CHECK LOGIC -------- */

  // ✅ FIX: use habitId not index
  const isChecked = (habitId, key) => !!checks[habitId]?.[key];

  const toggle = async (habitId, dateKey) => {
    await toggleCheck(habitId, dateKey);
    setChecks(prev => {
      const habitChecks = { ...(prev[habitId] || {}) };
      if (habitChecks[dateKey]) {
        delete habitChecks[dateKey];
      } else {
        habitChecks[dateKey] = true;
      }
      return { ...prev, [habitId]: habitChecks };
    });
  };

  /* -------- DAYS -------- */

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d    = i + 1;
    const key  = makeKey(year, month, d);
    const dt   = new Date(year, month, d);
    const t    = new Date(today);
    const type = key === today ? "today" : dt < t ? "past" : "future";
    return { d, key, type };
  });

  /* -------- STATS -------- */

  // ✅ FIX: use habit.id not hIdx
  const todayDone = habits.filter(h => isChecked(h.id, today)).length;

  const monthDone = habits.reduce((sum, habit) =>
    sum + days.filter(({ key }) => isChecked(habit.id, key)).length, 0);

  const monthTotal = habits.length * daysInMonth;
  const monthPct   = monthTotal ? Math.round((monthDone / monthTotal) * 100) : 0;

  const bestStreak = (() => {
    let best = 0;
    habits.forEach(habit => {
      let cur = 0;
      for (let i = 0; i < 90; i++) {
        const d2 = new Date(today);
        d2.setDate(d2.getDate() - i);
        const k = makeKey(d2.getFullYear(), d2.getMonth(), d2.getDate());
        if (isChecked(habit.id, k)) { cur++; best = Math.max(best, cur); }
        else cur = 0;
      }
    });
    return best;
  })();

  /* -------- RENDER -------- */

  if (loading) return <div className="dt-root"><p>Loading...</p></div>;

  return (
    <div className="dt-root">

      <header className="dt-header">
        <div className="dt-logo">DISCIPLINE<span>_OS</span></div>
        <div className="dt-header-right">
          <button className="dt-add-btn" onClick={addHabit}>+ Habit</button>
          <span className="dt-clock">{clock}</span>
          <span className="dt-month-badge">{monthName} {year}</span>
        </div>
      </header>

      <div className="dt-stats">
        <div className="dt-stat">
          <div className={`dt-stat-val ${todayDone === habits.length ? "active" : ""}`}>
            {todayDone}/{habits.length}
          </div>
          <div className="dt-stat-label">Today</div>
        </div>
        <div className="dt-stat">
          <div className={`dt-stat-val ${monthPct >= 80 ? "active" : ""}`}>{monthPct}%</div>
          <div className="dt-stat-label">Month</div>
        </div>
        <div className="dt-stat">
          <div className="dt-stat-val">{monthDone}</div>
          <div className="dt-stat-label">Completed</div>
        </div>
        <div className="dt-stat">
          <div className={`dt-stat-val ${bestStreak >= 7 ? "active" : ""}`}>{bestStreak}d</div>
          <div className="dt-stat-label">Best Streak</div>
        </div>
      </div>

      <div className="dt-grid-wrapper">
        <table className="dt-table">
          <thead>
            <tr>
              <th className="th-habit">HABIT</th>
              {days.map(({ d, type }) => (
                <th key={d} className={type === "today" ? "th-today" : ""}>
                  {String(d).padStart(2, "0")}
                </th>
              ))}
              <th className="th-streak">STK</th>
            </tr>
          </thead>

          <tbody>
            {habits.map((habit, hIdx) => {

              // ✅ FIX: use habit.id
              let streak = 0;
              for (let i = 0; i < 90; i++) {
                const d2 = new Date(today);
                d2.setDate(d2.getDate() - i);
                const k = makeKey(d2.getFullYear(), d2.getMonth(), d2.getDate());
                if (isChecked(habit.id, k)) streak++;
                else break;
              }

              const hDone = days.filter(({ key }) => isChecked(habit.id, key)).length;
              const hPct  = Math.round((hDone / daysInMonth) * 100);

              return (
                <tr key={habit.id}>
                  <td className="td-habit">
                    <div className="habit-row">
                      <span className="habit-icon">{habit.icon}</span>
                      <span className="habit-name">{habit.name}</span>
                      {habit.time && (
                        <span
                          className={`habit-time ${getTimerClass(hIdx)}`}
                          onClick={() => editHabitTime(habit)}
                          title="Click to edit time"
                          style={{ cursor: "pointer" }}
                        >
                          <span className="time-label">{habit.time}</span>
                          <span className="time-countdown">{formatTimer(hIdx)}</span>
                        </span>
                      )}
                      <span className="habit-pct">{hPct}%</span>
                      {/* ✅ FIX: pass habit.id not hIdx */}
                      <button className="habit-delete" onClick={() => removeHabit(habit.id)}>✕</button>
                    </div>
                  </td>

                  {days.map(({ d, key, type }) => {
                    const checked = isChecked(habit.id, key);
                    const cellClass = ["day-cell", `is-${type}`, checked ? "checked" : ""]
                      .filter(Boolean).join(" ");

                    return (
                      <td key={d} className={`td-day${type === "today" ? " td-today" : ""}`}>
                        <div
                          className={cellClass}
                          onClick={() => type === "today" && toggle(habit.id, key)}
                        />
                      </td>
                    );
                  })}

                  <td className="td-streak">
                    <span className={`streak-val${streak > 0 ? " active" : ""}`}>
                      {streak > 0 ? streak : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}