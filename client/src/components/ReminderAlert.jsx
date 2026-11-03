import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { isDueNow, reminderLabel, to12Hour } from "../utils/time";

// Shows a banner when a reminder's date + time has arrived.
export default function ReminderAlert() {
  const [reminders, setReminders] = useState([]);
  const [now, setNow] = useState(new Date());
  const [dismissed, setDismissed] = useState([]);

  // Side effect: load once, then re-check the clock every minute
  useEffect(() => {
    api.getReminders().then(setReminders).catch(() => {});
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer); // cleanup when the component goes away
  }, []);

  const due = reminders.filter((r) => r.person && !dismissed.includes(r._id) && isDueNow(r, now));

  return (
    <>
      {due.map((r) => (
        <div className="alert" key={r._id}>
          🔔 {r.person.name}'s birthday reminder ({reminderLabel(r.daysBefore)}, {to12Hour(r.time)})
          <button onClick={() => setDismissed([...dismissed, r._id])}>✕</button>
        </div>
      ))}
    </>
  );
}
