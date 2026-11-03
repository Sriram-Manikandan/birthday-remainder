import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReminderFields from "../components/ReminderFields";
import { api } from "../utils/api";
import { to24Hour, splitTime } from "../utils/time";

const emptyForm = { name: "", birthday: "", group: "friend", gift: "", about: "", instagramCaption: "" };

// Used for BOTH /add and /edit/:id
export default function PersonForm() {
  const { id } = useParams(); // id exists only on the edit page
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [reminders, setReminders] = useState([{ daysBefore: 0, hour: "7", minute: "00", ampm: "AM" }]);
  const [oldReminderIds, setOldReminderIds] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit mode: load the person and their reminders
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [person, savedReminders] = await Promise.all([api.getPerson(id), api.getReminders(id)]);
        setForm({ ...emptyForm, ...person });
        setOldReminderIds(savedReminders.map((r) => r._id));
        setReminders(savedReminders.map((r) => ({ daysBefore: r.daysBefore, ...splitTime(r.time) })));
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const saved = id ? await api.updatePerson(id, form) : await api.createPerson(form);

      // Replace the old reminders with the ones currently in the form
      await Promise.all(oldReminderIds.map((rid) => api.deleteReminder(rid)));
      await Promise.all(
        reminders.map((r) =>
          api.createReminder({ person: saved._id, daysBefore: r.daysBefore, time: to24Hour(r.hour, r.minute, r.ampm) })
        )
      );
      navigate(form.group === "friend" ? "/friends" : "/family");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{id ? "Edit person" : "Add a birthday"}</h2>
      {error && <p className="error">{error}</p>}

      <label>Name</label>
      <input name="name" value={form.name} onChange={handleChange} required />

      <label>Birthday</label>
      <input type="date" name="birthday" value={form.birthday} onChange={handleChange} required />

      <label>Group</label>
      <select name="group" value={form.group} onChange={handleChange}>
        <option value="friend">Friend</option>
        <option value="family">Family</option>
      </select>

      <label>Gift I plan to give 🎁</label>
      <input name="gift" value={form.gift} onChange={handleChange} />

      <label>About them (what I like about them)</label>
      <textarea name="about" rows="3" value={form.about} onChange={handleChange} />

      <label>Instagram birthday post / caption 📸</label>
      <textarea name="instagramCaption" rows="3" value={form.instagramCaption} onChange={handleChange} />

      <ReminderFields reminders={reminders} setReminders={setReminders} />

      <button className="btn" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
    </form>
  );
}
