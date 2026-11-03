import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { reminderDate, sameDay, to12Hour, reminderLabel } from "../utils/time";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [people, setPeople] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getPeople(), api.getReminders()])
      .then(([p, r]) => { setPeople(p); setReminders(r); })
      .catch((err) => setError(err.message));
  }, []);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const blanks = new Date(year, monthIndex, 1).getDay(); // empty cells before the 1st
  const today = new Date();

  const changeMonth = (step) => setMonth(new Date(year, monthIndex + step, 1));

  // Build one cell per day
  const cells = [];
  for (let i = 0; i < blanks; i++) cells.push(<div className="cell empty" key={"b" + i} />);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);

    const birthdays = people.filter((p) => {
      const [, m, d] = p.birthday.split("-").map(Number);
      return m === monthIndex + 1 && d === day;
    });

    // A reminder can fall in this year or (for early-January birthdays) land in late December
    const dueReminders = reminders.filter(
      (r) => r.person && [year, year + 1].some((y) => sameDay(reminderDate(r.person.birthday, r.daysBefore, y), date))
    );

    cells.push(
      <div className={"cell" + (sameDay(date, today) ? " today" : "")} key={day}>
        <span className="day-number">{day}</span>
        {birthdays.map((p) => (
          <div key={p._id} className={"event bday " + p.group}>🎂 {p.name}</div>
        ))}
        {dueReminders.map((r) => (
          <div key={r._id} className="event remind">
            ⏰ {r.person.name} · {to12Hour(r.time)}
            {r.daysBefore > 0 && <small> ({reminderLabel(r.daysBefore)})</small>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2>📅 Calendar</h2>
      {error && <p className="error">{error}</p>}
      <div className="cal-header">
        <button className="btn-small" onClick={() => changeMonth(-1)}>◀</button>
        <h3>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
        <button className="btn-small" onClick={() => changeMonth(1)}>▶</button>
      </div>
      <div className="legend">
        <span className="event bday friend">🎂 Friend</span>
        <span className="event bday family">🎂 Family</span>
        <span className="event remind">⏰ Reminder</span>
      </div>
      <div className="calendar">
        {DAY_NAMES.map((d) => <div className="day-name" key={d}>{d}</div>)}
        {cells}
      </div>
    </div>
  );
}
