const pad = (n) => String(n).padStart(2, "0");

// "07:00" -> "7:00 AM"   ("00:00" -> "12:00 AM", "13:30" -> "1:30 PM")
export function to12Hour(time) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${ampm}`;
}

// (7, "00", "PM") -> "19:00"  (we store 24h text in the database)
export function to24Hour(hour, minute, ampm) {
  let h = Number(hour) % 12;
  if (ampm === "PM") h += 12;
  return `${pad(h)}:${minute}`;
}

// "19:00" -> { hour: "7", minute: "00", ampm: "PM" }  (used to fill the form)
export function splitTime(time) {
  const [h, m] = time.split(":").map(Number);
  return { hour: String(h % 12 === 0 ? 12 : h % 12), minute: pad(m), ampm: h >= 12 ? "PM" : "AM" };
}

export const reminderLabel = (days) =>
  days === 0 ? "On the day" : days === 1 ? "1 day before" : days === 7 ? "1 week before" : `${days} days before`;

// "2000-03-25" -> "March 25, 2000"
export function formatBirthday(birthday) {
  const [y, m, d] = birthday.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function daysUntilBirthday(birthday) {
  const [, m, d] = birthday.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
  return Math.round((next - today) / 86400000);
}

// The date a reminder fires in a given year (birthday minus daysBefore)
export function reminderDate(birthday, daysBefore, year) {
  const [, m, d] = birthday.split("-").map(Number);
  return new Date(year, m - 1, d - daysBefore); // JS handles month roll-over for us
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export { sameDay };

// Is this reminder due today, and has its time already passed?
export function isDueNow(reminder, now) {
  const nowText = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return [now.getFullYear(), now.getFullYear() + 1].some(
    (y) => sameDay(reminderDate(reminder.person.birthday, reminder.daysBefore, y), now) && reminder.time <= nowText
  );
}
