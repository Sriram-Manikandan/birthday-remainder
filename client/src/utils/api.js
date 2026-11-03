// One helper that every API call goes through (async/await + error handling)
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong"); // 4xx / 5xx
  return data;
}

const send = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  getPeople: (group) => request(group ? `/api/people?group=${group}` : "/api/people"),
  getPerson: (id) => request(`/api/people/${id}`),
  createPerson: (data) => request("/api/people", send("POST", data)),
  updatePerson: (id, data) => request(`/api/people/${id}`, send("PUT", data)),
  deletePerson: (id) => request(`/api/people/${id}`, { method: "DELETE" }),

  getReminders: (personId) =>
    request(personId ? `/api/reminders?person=${personId}` : "/api/reminders"),
  createReminder: (data) => request("/api/reminders", send("POST", data)),
  deleteReminder: (id) => request(`/api/reminders/${id}`, { method: "DELETE" }),
};
