// A list of reminder rows. State lives in the parent (PersonForm), we only display + report changes.
const HOURS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const MINUTES = ["00", "15", "30", "45"];

export default function ReminderFields({ reminders, setReminders }) {
  function change(index, field, value) {
    setReminders(reminders.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }
  const addRow = () =>
    setReminders([...reminders, { daysBefore: 0, hour: "7", minute: "00", ampm: "AM" }]);
  const removeRow = (index) => setReminders(reminders.filter((_, i) => i !== index));

  return (
    <div>
      <label>Reminders</label>
      {reminders.map((r, i) => (
        <div className="reminder-row" key={i}>
          <select value={r.daysBefore} onChange={(e) => change(i, "daysBefore", Number(e.target.value))}>
            <option value={0}>On the day</option>
            <option value={1}>1 day before</option>
            <option value={3}>3 days before</option>
            <option value={7}>1 week before</option>
          </select>
          <select value={r.hour} onChange={(e) => change(i, "hour", e.target.value)}>
            {HOURS.map((h) => <option key={h}>{h}</option>)}
          </select>
          <select value={r.minute} onChange={(e) => change(i, "minute", e.target.value)}>
            {MINUTES.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={r.ampm} onChange={(e) => change(i, "ampm", e.target.value)}>
            <option>AM</option>
            <option>PM</option>
          </select>
          <button type="button" className="btn-small danger" onClick={() => removeRow(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="btn-small" onClick={addRow}>+ Add reminder</button>
    </div>
  );
}
