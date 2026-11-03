import { Link } from "react-router-dom";
import { formatBirthday, daysUntilBirthday, reminderLabel, to12Hour } from "../utils/time";

export default function PersonCard({ person, reminders, onDelete }) {
  const days = daysUntilBirthday(person.birthday);

  return (
    <div className="card">
      <div className="card-top">
        <h3>{person.name}</h3>
        <span className="badge">{days === 0 ? "🎉 Today!" : `in ${days} day${days === 1 ? "" : "s"}`}</span>
      </div>
      <p className="muted">{formatBirthday(person.birthday)}</p>

      {person.gift && <p>🎁 <b>Gift:</b> {person.gift}</p>}
      {person.about && <p>💬 <b>About:</b> {person.about}</p>}
      {person.instagramCaption && (
        <div className="caption">
          <p>📸 {person.instagramCaption}</p>
          <button onClick={() => navigator.clipboard.writeText(person.instagramCaption)}>Copy caption</button>
        </div>
      )}

      <div className="tags">
        {reminders.map((r) => (
          <span className="tag" key={r._id}>⏰ {reminderLabel(r.daysBefore)} · {to12Hour(r.time)}</span>
        ))}
      </div>

      <div className="actions">
        <Link to={`/edit/${person._id}`} className="btn-small">Edit</Link>
        <button className="btn-small danger" onClick={() => onDelete(person)}>Delete</button>
      </div>
    </div>
  );
}
