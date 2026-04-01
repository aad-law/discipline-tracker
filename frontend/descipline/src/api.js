const BASE_URL = "http://localhost:8080/api";

// ─── HABITS ───────────────────────────────────────

export async function fetchHabits() {
  const res = await fetch(`${BASE_URL}/habits`);
  return res.json();
}

export async function createHabit(habit) {
  const res = await fetch(`${BASE_URL}/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  return res.json();
}

export async function updateHabit(id, habit) {
  const res = await fetch(`${BASE_URL}/habits/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  return res.json();
}

export async function deleteHabit(id) {
  await fetch(`${BASE_URL}/habits/${id}`, { method: "DELETE" });
}

// ─── CHECKS ───────────────────────────────────────

export async function fetchChecks(habitId) {
  const res = await fetch(`${BASE_URL}/checks/${habitId}`);
  return res.json();
}

export async function toggleCheck(habitId, date) {
  const res = await fetch(`${BASE_URL}/checks/${habitId}/${date}`, {
    method: "POST",
  });
  // returns null when unchecked, object when checked
  if (res.status === 204 || res.headers.get("content-length") === "0") return null;
  return res.json();
}