import { useState, useEffect } from "react";
import PersonCard from "../components/PersonCard";
import { api } from "../utils/api";
import { daysUntilBirthday } from "../utils/time";

// One component reused for both tabs: <PeoplePage group="friend" /> and group="family"
export default function PeoplePage({ group }) {
  const [people, setPeople] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs on first render AND again whenever "group" changes (friends <-> family)
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [peopleData, reminderData] = await Promise.all([api.getPeople(group), api.getReminders()]);
        setPeople(peopleData.sort((a, b) => daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday)));
        setReminders(reminderData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [group]);

  async function handleDelete(person) {
    if (!window.confirm(`Delete ${person.name}?`)) return;
    try {
      await api.deletePerson(person._id);
      setPeople(people.filter((p) => p._id !== person._id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>{group === "friend" ? "👯 Friends" : "👨‍👩‍👧 Family"}</h2>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && people.length === 0 && <p className="muted">Nobody here yet. Click "+ Add"!</p>}
      <div className="grid">
        {people.map((p) => (
          <PersonCard
            key={p._id}
            person={p}
            reminders={reminders.filter((r) => r.person && r.person._id === p._id)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
