import { useState, useEffect, useMemo } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from "recharts";
import { fetchHabits, fetchChecks } from "../../api";
import "./Analytics.css";

/* -------- UTILITIES -------- */

function makeKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDateRange(type) {
  const today = new Date();
  const startDate = new Date(today);
  switch (type) {
    case "1month":  startDate.setMonth(today.getMonth() - 1);       break;
    case "3months": startDate.setMonth(today.getMonth() - 3);       break;
    case "6months": startDate.setMonth(today.getMonth() - 6);       break;
    case "1year":   startDate.setFullYear(today.getFullYear() - 1); break;
    case "alltime": startDate.setFullYear(2000);                    break;
    default:        startDate.setMonth(today.getMonth());
  }
  return { startDate, endDate: today };
}

function calculateHabitStats(habits, checks, startDate, endDate) {
  const data = [];

  habits.forEach((habit) => {
    let completed = 0;
    let total = 0;

    const current = new Date(startDate);
    while (current <= endDate) {
      total++;
      const key = makeKey(
        current.getFullYear(),
        current.getMonth(),
        current.getDate()
      );
      // ✅ use habit.id as key instead of hIdx
      if (checks[habit.id]?.[key]) {
        completed++;
      }
      current.setDate(current.getDate() + 1);
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    data.push({
      name: habit.name.substring(0, 12),
      value: percentage,
      fullName: habit.name,
      completed,
      total,
    });
  });

  return data;
}

/* -------- COMPONENT -------- */

export default function Analytics() {
  const [timeFilter,   setTimeFilter]   = useState("1month");
  const [showCustom,   setShowCustom]   = useState(false);
  const [customStart,  setCustomStart]  = useState("");
  const [customEnd,    setCustomEnd]    = useState("");
  const [customActive, setCustomActive] = useState(false);

  // ✅ replaced localStorage with API state
  const [habits,  setHabits]  = useState([]);
  const [checks,  setChecks]  = useState({});
  const [loading, setLoading] = useState(true);

  /* -------- LOAD FROM BACKEND -------- */
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

  /* -------- DATE RANGE -------- */
  const { startDate, endDate } = useMemo(() => {
    if (customActive && customStart && customEnd) {
      return {
        startDate: new Date(customStart),
        endDate: new Date(customEnd),
      };
    }
    return getDateRange(timeFilter);
  }, [timeFilter, customActive, customStart, customEnd]);

  const chartData = useMemo(
    () => calculateHabitStats(habits, checks, startDate, endDate),
    [habits, checks, startDate, endDate]
  );

  /* -------- HANDLERS -------- */
  const filterButtons = [
    { value: "1month",  label: "1 Month"  },
    { value: "3months", label: "3 Months" },
    { value: "6months", label: "6 Months" },
    { value: "1year",   label: "1 Year"   },
    { value: "alltime", label: "All Time" },
  ];

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      if (new Date(customStart) <= new Date(customEnd)) {
        setCustomActive(true);
        setTimeFilter("custom");
      } else {
        alert("Start date must be before end date");
      }
    } else {
      alert("Please select both start and end dates");
    }
  };

  const handleResetCustom = () => {
    setCustomActive(false);
    setCustomStart("");
    setCustomEnd("");
    setShowCustom(false);
    setTimeFilter("1month");
  };

  const totalCompletion = chartData.length > 0
    ? Math.round(chartData.reduce((sum, h) => sum + h.value, 0) / chartData.length)
    : 0;

  const bestHabit = chartData.length > 0
    ? chartData.reduce((best, h) => (h.value > best.value ? h : best))
    : null;

  /* -------- RENDER -------- */

  if (loading) return <div className="analytics-container"><p>Loading...</p></div>;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">📊 Performance Analytics</h1>
        <p className="analytics-subtitle">Track your habits across time</p>
      </div>

      {/* FILTERS */}
      <div className="filter-section">
        <h3 className="filter-label">📅 Select Time Period:</h3>
        <div className="filter-buttons">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              className={`filter-btn ${timeFilter === btn.value && !customActive ? "active" : ""}`}
              onClick={() => {
                setTimeFilter(btn.value);
                setCustomActive(false);
                setShowCustom(false);
              }}
            >
              {btn.label}
            </button>
          ))}
          <button
            className={`filter-btn custom-btn ${showCustom ? "active" : ""}`}
            onClick={() => setShowCustom(!showCustom)}
          >
            📆 Custom Range
          </button>
        </div>

        {showCustom && (
          <div className="custom-range-picker">
            <div className="date-inputs">
              <div className="input-group">
                <label htmlFor="custom-start">Start Date:</label>
                <input
                  id="custom-start"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="input-group">
                <label htmlFor="custom-end">End Date:</label>
                <input
                  id="custom-end"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
            <div className="button-group">
              <button className="apply-btn" onClick={handleCustomRange}>✓ Apply</button>
              <button className="cancel-btn" onClick={() => setShowCustom(false)}>✕ Cancel</button>
              {customActive && (
                <button className="reset-btn" onClick={handleResetCustom}>🔄 Reset</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DATE RANGE INFO */}
      <div className={`date-range ${customActive ? "custom-active" : ""}`}>
        <span className="date-text">
          📅 {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </span>
        {customActive && <span className="custom-badge">Custom</span>}
      </div>

      {/* RADAR CHART */}
      <div className="chart-wrapper">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="#1a1a1a" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "#555", fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#2a2a2a", fontSize: 10 }} />
              <Radar
                name="Completion %"
                dataKey="value"
                stroke="#33ff77"
                fill="#0f2218"
                fillOpacity={0.7}
                dot={{ fill: "#33ff77", r: 4 }}
                activeDot={{ r: 6, fill: "#33ff77" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#0d0d0d",
                  border: "1px solid #33ff77",
                  borderRadius: "0",
                  padding: "8px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#33ff77",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}%`, "Completion"]}
                labelFormatter={(label) => `${label}`}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>No habits tracked yet. Start adding habits to see analytics!</p>
          </div>
        )}
      </div>

      {/* STATS SUMMARY */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalCompletion}%</div>
          <div className="stat-label">Overall Completion</div>
        </div>
        {bestHabit && (
          <div className="stat-card">
            <div className="stat-value">⭐</div>
            <div className="stat-label">Best: {bestHabit.fullName}</div>
            <div className="stat-sub">{bestHabit.value}% done</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-value">{chartData.length}</div>
          <div className="stat-label">Active Habits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{chartData.reduce((sum, h) => sum + h.completed, 0)}</div>
          <div className="stat-label">Total Completions</div>
          <div className="stat-sub">in period</div>
        </div>
      </div>

      {/* DETAILED TABLE */}
      <div className="details-section">
        <h2 className="section-title">📈 Detailed Breakdown</h2>
        <div className="table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>Habit</th>
                <th>Completed</th>
                <th>Total Days</th>
                <th>Completion %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((habit, idx) => (
                <tr key={idx}>
                  <td className="habit-name">{habit.fullName}</td>
                  <td>{habit.completed}</td>
                  <td>{habit.total}</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${habit.value}%` }} />
                      <span className="progress-text">{habit.value}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${habit.value >= 80 ? "excellent" : habit.value >= 60 ? "good" : "fair"}`}>
                      {habit.value >= 80 ? "Excellent" : habit.value >= 60 ? "Good" : "Fair"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}